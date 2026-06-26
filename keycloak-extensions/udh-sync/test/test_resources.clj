(ns test-resources "Integration tests for data-hub resources"
    (:require [clojure.string :as str]
              [clojure.java.io :as io]
              [clojure.test :as t :refer [deftest is]]
              [babashka.http-client :as http]
              [cheshire.core :as json]
              [taoensso.timbre :as timbre])
    (:import [java.security KeyStore]
             [java.security.cert CertificateFactory]
             [javax.net.ssl TrustManagerFactory SSLContext]))

(timbre/set-level! :info)

(def keycloak-host (str "login"
                        (get (System/getenv)
                             "TARGET_URL_SUFFIX"
                             ".data-hub.local")))

;; utils

(defn create-ssl-context [crt-file]
  (let [certificate (.generateCertificate (CertificateFactory/getInstance "X.509")
                                          (io/input-stream crt-file))
        key-store (doto (KeyStore/getInstance (KeyStore/getDefaultType))
                    (.load nil)
                    (.setCertificateEntry "caCert" certificate))
        trust-manager (.getTrustManagers
                       (doto (TrustManagerFactory/getInstance (TrustManagerFactory/getDefaultAlgorithm))
                         (.init key-store)))]
    (doto (SSLContext/getInstance "TLS")
      (.init nil trust-manager nil))))

(defn json-payload [j]
  {:body (json/encode j)
   :headers {:content-type "application/json"}})

(def resource-prefix "itest-")

(defn random-name []
  (subs (str resource-prefix (random-uuid))
        0
        36))

(defn json-decode [s]
  (json/decode s true))

(defn d
  "Debug function for use only during development!
   Prints all arguments (if evaluation finishes without exception)
   and passes the last one on.
   Wrap forms or put into threading macros."
  [& args]
  (last (doto args println)))

(def ^:dynamic *host* nil)
(def ^:dynamic *basic-auth* nil)
(def ^:dynamic *bearer* nil)
(defn common-http [path opts]
  (let [final-opts (merge {:uri (str "https://" *host* path)
                           :method :get
                           :return #(-> % :body json-decode)
                           :client (http/client
                                    (merge {:version :http1.1}
                                           (when-let [ca (System/getenv "NODE_EXTRA_CA_CERTS")]
                                             {:ssl-context
                                              (create-ssl-context ca)})))}
                          (when *basic-auth* {:basic-auth *basic-auth*})
                          (if *bearer*
                            (assoc-in opts
                                      [:headers "Authorization"]
                                      (str "Bearer " *bearer*))
                            opts))]
    (timbre/debug "HTTP request" ((juxt :method :uri :query-params) final-opts))
    ((:return final-opts)
     (http/request final-opts))))

(def admin-password (get (System/getenv)
                         "DATA_HUB_ADMIN_PASSWORD"
                         "adminpassword"))

(defn token [user]
  (binding [*host* (str keycloak-host "/realms/udh")]
    (-> (common-http "/protocol/openid-connect/token"
                     {:method :post
                      :form-params
                      {:client_id "automated-tests-client" ; settings for integration test environment
                       :client_secret admin-password
                       :grant_type "password"
                       :password admin-password
                       :username user}})
        :access_token)))

(def ^:dynamic *user* {:username "data-hub-admin@example.com"})
(defn http [path {:keys [assert-status assert-body json] :as opts}]
  (binding [*host* (or *host* (str keycloak-host
                                   "/realms/udh/data-hub")) *bearer* (some-> *user* :username token)]
    (let [response
          (common-http path
                       (merge {:return identity}
                              opts
                              (when assert-status {:throw false})
                              (when json (json-payload json))))]
      (let [{:keys [body status]} response]
        (when assert-status (is (= assert-status status)))
        (when assert-body (is (-> body json-decode assert-body)
                              (str "body is " body))))
      response)))

(defn create-user [& groups]
  (binding [*host* (str keycloak-host
                        "/admin/realms/udh")]
    (let [email (str (random-name) "@example.com")
          id (http "/users"
                   {:method :post
                    :json
                    {:email email
                     :username email
                     :firstName "firstName"
                     :lastName "lastName"
                     :attributes {:showName true}
                     :groups (map #(str "/" (str/join "/" %))
                                  groups)
                     :enabled true}
                    :return #(-> % :headers (get "location") (str/split #"/") last)})]
      (http (str "/users/" id "/reset-password")
            {:method :put
             :json
             {:temporary false
              :type "password"
              :value admin-password}})
      {:username email
       :id id})))

(def OK 200)
(def CREATED 201)
(def NO_CONTENT 204)
(def BAD_REQUEST 400)
(def FORBIDDEN 403)
(def NOT_FOUND 404)
(def CONFLICT 409)

(defn create-tenant [& {:keys [groups projects viz-groups]}]
  (let [tenant (random-name)]
    (http (str "/tenants/" tenant)
          {:method :put})
    (run! #(http (str "/tenants/" tenant "/groups/" %)
                 {:method :put})
          groups)
    (run! #(http (str "/tenants/" tenant "/projects/" %)
                 {:method :put})
          projects)
    (run! #(http (str "/tenants/" tenant "/viz-groups/" %)
                 {:method :put})
          viz-groups)
    tenant))

;; misc API properties

(deftest invalid-json
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/groups/admin/permissions/foobar")
          {:method :put
           :headers {:content-type "application/json"}
           :body "notjson"
           :assert-status BAD_REQUEST})))

(deftest invalid-schema
  (let [tenant (create-tenant)]
    (doseq [json [{:scopes ["group:view"]
                   :principals [[]]}
                  {:scopes ["group:view"]
                   :principals [9]}
                  {:scopes ["group:view"]
                   :principals ["admin"]
                   :extra ["something"]}]]
      (http (str "/tenants/" tenant "/groups/admin/permissions/foobar")
            {:method :put
             :json json
             :assert-status BAD_REQUEST}))))

(deftest invalid-name
  (http "/tenants/Invalid"
        {:assert-status BAD_REQUEST}))

(deftest list-valid-scopes
  (http (str "/tenants/" (create-tenant) "/scopes")
        {:assert-status OK
         :assert-body #(-> % :all set (contains? "sensor-credential:rotate"))}))

(deftest list-granted-scopes
  (let [tenant (create-tenant {:projects #{"p1"}})
        user (create-user [tenant])]
    (http (str "/tenants/" tenant "/scopes")
          {:assert-body #(-> % :granted set (= #{"tenant:admin"
                                                 "tenant:read"
                                                 "tenant:view"
                                                 "tenant:ckan-admin"
                                                 "tenant:ckan-editor"
                                                 "tenant:ckan-member"
                                                 "tenant:discourse-moderator"
                                                 "tenant:discourse-member"}))})

    (http (str "/tenants/" tenant "/permissions/seeallprojects")
          {:method :put
           :json {:scopes ["project:view"]
                  :principals [{:type "tenant" :tenant tenant}]}})
    (http (str "/tenants/" tenant "/permissions/writebuckets")
          {:method :put
           :json {:scopes ["project:bucket-write"]
                  :principals [{:type "tenant" :tenant tenant}]}})
    (binding [*user* user]
      (http (str "/tenants/" tenant "/projects/p1/scopes")
            {:assert-body #(-> % :granted set (= #{"project:view" "project:bucket-write"}))}))))

;; basic resource management

(deftest tenants
  (let [tenant (random-name)]
    (http (str "/tenants/" tenant)
          {:method :put
           :assert-status CREATED
           :assert-body #{{:name tenant}}})
    (http (str "/tenants/" tenant)
          {:method :put
           :assert-status CONFLICT})

    (http (str "/tenants/" tenant)
          {:assert-status NO_CONTENT})
    (http (str "/tenants")
          {:assert-status OK
           :assert-body #(-> % set (contains? tenant))})

    (http (str "/tenants/" tenant)
          {:method :delete
           :assert-status NO_CONTENT})
    (http (str "/tenants/" tenant)
          {:method :delete
           :assert-status NOT_FOUND})

    (http (str "/tenants")
          {:assert-body #(is (not (-> % set (contains? tenant))))})))

(deftest tenant-name-not-autogenerated
  (http (str "/tenants/" (random-name))
        {:method :post
         :assert-status NOT_FOUND}))

;; tenant setup

(deftest new-tenant-has-admin-and-read-groups
  (http (str "/tenants/" (create-tenant) "/groups")
        {:assert-body #{["admin" "read" "ckan-editor"]}}))

(deftest admin-group-has-tenant-admin
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/permissions/admin")
          {:assert-body #{{:scopes ["tenant:admin"]
                           :principals [{:type "group" :tenant tenant :group "admin"}]}}})))

(deftest read-group-has-tenant-read
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/permissions/read")
          {:assert-body #{{:scopes ["tenant:read"]
                           :principals [{:type "group" :tenant tenant :group "read"}]}}})))

(deftest toplevel-group-has-tenant-view
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/permissions/members")
          {:assert-body #{{:scopes ["citytool:view" "dedicated-app:view" "tenant:ckan-member" "tenant:discourse-member" "tenant:view"]
                           :principals [{:type "tenant" :tenant tenant}]}}})))

(deftest new-admin-user-can-only-see-their-tenant's-groups
  (let [tenant (create-tenant {:groups #{"foo"}})
        other-tenant (create-tenant {:groups #{"foo"}})]
    (binding [*user* (create-user [tenant "admin"])]
      (http (str "/tenants/" tenant "/groups/foo")
            {:assert-status NO_CONTENT})
      (http (str "/tenants/" other-tenant "/groups/foo")
            {:assert-status NOT_FOUND}))))

(deftest new-user-can't-see-groups
  (let [tenant (create-tenant)]
    (binding [*user* (create-user [tenant])]
      (http (str "/tenants/" tenant "/groups")
            {:assert-body empty?}))))

;; permissions

(deftest create-update-permission
  (let [tenant (create-tenant)
        initial-permission {:scopes ["group:admin"]
                            :principals [{:type "group" :tenant tenant :group "admin"}]}
        updated-permission {:scopes ["group:view"]
                            :principals [{:type "group" :tenant tenant :group "admin"}]}]
    (http (str "/tenants/" tenant "/groups/admin/permissions/foobar")
          {:method :put
           :assert-status CREATED
           :json initial-permission})
    (http (str "/tenants/" tenant "/groups/admin/permissions/foobar")
          {:method :put
           :assert-status NO_CONTENT
           :json updated-permission})
    (http (str "/tenants/" tenant "/groups/admin/permissions")
          {:assert-body #{[(assoc updated-permission
                                  :name
                                  "foobar")]}})))

(deftest list-permissions
  (let [tenant (create-tenant)
        expected {:name "members"
                  :scopes ["citytool:view" "dedicated-app:view" "tenant:ckan-member" "tenant:discourse-member" "tenant:view"]
                  :principals [{:type "tenant" :tenant tenant}]}]
    (http (str "/tenants/" tenant "/permissions")
          {:assert-body #(-> % set (contains? expected))})))

(deftest delete-permission
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/permissions/admin")
          {:method :delete
           :assert-status NO_CONTENT})
    (http (str "/tenants/" tenant "/permissions")
          {:assert-body #(->> % (map :name) (some #{"admin"}) not)})))

(deftest permission-not-found
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/permissions/everyoneadmin")
          {:method :put
           :json {:scopes ["tenant:admin"]
                  :principals [{:type :tenant :tenant tenant}]}})
    (binding [*user* (create-user [tenant])]
      (http (str "/tenants/" tenant "/permissions/doesnotexist")
            {:method :delete
             :assert-status NOT_FOUND}))))

(deftest group-delete-deletes-permission
  (let [tenant (create-tenant {:groups #{"group1" "group2"}})]
    (http (str "/tenants/" tenant "/permissions/twogroups")
          {:method :put
           :json {:scopes ["tenant:admin"]
                  :principals [{:type "group" :tenant tenant :group "group1"} {:type "group" :tenant tenant :group "group2"}]}})

    (http (str "/tenants/" tenant "/groups/group1")
          {:method :delete})
    (http (str "/tenants/" tenant "/permissions/twogroups")
          {:assert-body #(-> % :principals (= [{:type "group" :tenant tenant :group "group2"}]))})

    (http (str "/tenants/" tenant "/groups/group2")
          {:method :delete})
    (http (str "/tenants/" tenant "/permissions/twogroups")
          {:assert-status NOT_FOUND})))

(deftest resource-delete-deletes-permission
  (let [tenant (create-tenant {:groups #{"foo"}})]
    (http (str "/tenants/" tenant "/groups/foo/permissions/bar")
          {:method :put
           :json {:scopes ["group:view"]
                  :principals [{:type "group" :tenant tenant :group "admin"}]}})

    (http (str "/tenants/" tenant "/groups/foo")
          {:method :delete})
    (http (str "/tenants/" tenant "/groups/foo")
          {:method :put})

    (http (str "/tenants/" tenant "/groups/foo/permissions")
          {:assert-body empty?})))

(deftest invalid-scope
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/groups/admin/permissions/foobar")
          {:method :put
           :json {:scopes ["lorawan-credential:view"]
                  :principals [{:type "group" :tenant tenant :group "admin"}]}
           :assert-status BAD_REQUEST})))

(deftest group-in-permission-not-found
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/groups/admin/permissions/foobar")
          {:method :put
           :json {:scopes ["group:view"]
                  :principals [{:type "group" :tenant tenant :group "doesnotexist"}]}
           :assert-status NOT_FOUND})))

(deftest two-scopes-groups-#159
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/permissions/foobar")
          {:method :put
           :json {:scopes ["group:admin"]
                  :principals [{:type "group" :tenant tenant :group "admin"} {:type "tenant" :tenant tenant}]}})
    (http (str "/tenants/" tenant "/permissions") {})))

;; hierarchy

(deftest group-needs-tenant
  (http (str "/tenants/" (random-name) "/groups/" (random-name))
        {:method :put
         :assert-status NOT_FOUND}))

(deftest groups-are-scoped
  (let [group (random-name)]
    (http (str "/tenants/" (create-tenant) "/groups/" group)
          {:method :put})

    (http (str "/tenants/" (create-tenant) "/groups")
          {:assert-body #(-> % set (contains? group) not)})))

(deftest delete-is-recursive
  (let [tenant (create-tenant)
        project (random-name)]
    (http (str "/tenants/" tenant "/projects/" project)
          {:method :put})
    (http (str "/tenants/" tenant)
          {:method :delete})
    (http (str "/tenants/" tenant)
          {:method :put})
    (http (str "/tenants/" tenant "/projects/" project)
          {:assert-status NOT_FOUND})))

;; sub-resource management

(deftest group-create-list-delete
  (let [tenant (create-tenant)
        group (random-name)]
    (http (str "/tenants/" tenant "/groups/" group)
          {:method :put
           :assert-status CREATED})
    (http (str "/tenants/" tenant "/groups")
          {:assert-body #(-> % set (contains? group))})
    (http (str "/tenants/" tenant "/groups/" group)
          {:method :delete
           :assert-status NO_CONTENT})))

;; permission evaluation

(deftest permissions-are-transitive
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/permissions/viewgroups")
          {:method :put
           :json {:scopes ["group:view"]
                  :principals [{:type "tenant" "tenant" tenant}]}})
    (binding [*user* (create-user [tenant])]
      (http (str "/tenants/" tenant "/groups")
            {:assert-body not-empty}))))

(deftest admin-scope-includes-all
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/permissions/admingroups")
          {:method :put
           :json {:scopes ["group:admin"]
                  :principals [{:type "tenant" "tenant" tenant}]}})
    (binding [*user* (create-user [tenant])]
      (http (str "/tenants/" tenant "/groups")
            {:assert-body not-empty}))))

(deftest admin-scope-applies-to-subtypes
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/permissions/everyoneadmin")
          {:method :put
           :json {:scopes ["tenant:admin"]
                  :principals [{:type "tenant" "tenant" tenant}]}})
    (binding [*user* (create-user [tenant])]
      (http (str "/tenants/" tenant "/groups")
            {:assert-body not-empty})))

  ; :admin not at top-level
  (let [tenant (create-tenant {:projects #{"p1"}})
        cred-path (str "/tenants/" tenant "/projects/p1/sensor-credentials/cred1")]
    (http (str "/tenants/" tenant "/projects/p1/permissions/projectadmin")
          {:method :put
           :json {:scopes ["project:admin"]
                  :principals [{:type "tenant" "tenant" tenant}]}})
    (http cred-path {:method :put})
    (binding [*user* (create-user [tenant])]
      (http cred-path
            {:assert-status NO_CONTENT}))))

;; permission requirements

(deftest resource-management-requires-admin-on-parent
  (let [tenant (create-tenant)
        user (create-user [tenant])]
    (binding [*user* user]
      (http (str "/tenants/" tenant "/groups/newgroup")
            {:method :put
             :assert-status FORBIDDEN})
      (http (str "/tenants/" tenant "/groups/admin")
            {:method :delete
             :assert-status FORBIDDEN}))

    (http (str "/tenants/" tenant "/permissions/everyoneadmin")
          {:method :put
           :json {:scopes ["tenant:admin"]
                  :principals [{:type "tenant" "tenant" tenant}]}})
    (binding [*user* user]
      (http (str "/tenants/" tenant "/groups/newgroup")
            {:method :put})
      (http (str "/tenants/" tenant "/groups/admin")
            {:method :delete}))))

(deftest permission-management-requires-admin
  (let [tenant (create-tenant)
        user (create-user [tenant])
        permission {:scopes ["tenant:admin"]
                    :principals [{:type "tenant" "tenant" tenant}]}]
    (binding [*user* user]
      (http (str "/tenants/" tenant "/permissions")
            {:assert-status FORBIDDEN})
      (http (str "/tenants/" tenant "/permissions/doesnotexist")
            {:method :delete
             :assert-status FORBIDDEN})
      (http (str "/tenants/" tenant "/permissions/usercreatedthing")
            {:method :put
             :json permission
             :assert-status FORBIDDEN})
      (http (str "/tenants/" tenant "/permissions/admin")
            {:method :delete
             :assert-status FORBIDDEN}))

    (http (str "/tenants/" tenant "/permissions/everyoneadmin")
          {:method :put
           :json {:scopes ["tenant:admin"]
                  :principals [{:type "tenant" "tenant" tenant}]}})
    (binding [*user* user]
      (http (str "/tenants/" tenant "/permissions/usercreatedthing")
            {:method :put
             :json permission}))))

(deftest multiple-scopes-and-groups-don't-cause-problems
  (let [tenant (create-tenant {:groups #{"sub" "sub2"} :projects #{"p"}})
        user (create-user [tenant "sub"])]
    (http (str "/tenants/" tenant "/projects/p/permissions/read-access")
          {:method :put
           :json {:scopes ["project:view" "project:clickhouse-read"]
                  :principals [{:type "group" "tenant" tenant :group "sub"} {:type "group" "tenant" tenant :group "sub2"}]}})

    (binding [*user* user]
      (http (str "/tenants/" tenant "/projects")
            {:assert-body #{["p"]}}))))

(deftest only-visible-groups-can-be-added
  (let [tenant (create-tenant {:groups #{"foo"}})
        permission {:scopes ["group:view"]
                    :principals [{:type "group" "tenant" tenant :group "admin"}]}] ; admin group not visible for user
    (http (str "/tenants/" tenant "/groups/foo/permissions/fooadmin")
          {:method :put
           :json {:scopes ["group:admin"]
                  :principals [{:type "tenant" "tenant" tenant}]}})
    (binding [*user* (create-user [tenant])]
      (http (str "/tenants/" tenant "/groups/foo/permissions/cantbecreated")
            {:method :put
             :json permission
             :assert-status NOT_FOUND}))

    (http (str "/tenants/" tenant "/groups/foo/permissions/cantbecreated")
          {:method :put
           :json permission})

    ; if created by someone else name is visible
    (http (str "/tenants/" tenant "/groups/foo/permissions/cantbecreated")
          {:assert-body #(-> % :principals set (contains? {:type "group" :tenant tenant :group "admin"}))})))

(deftest groups-from-other-tenants-can-be-added
  (let [tenant1 (create-tenant {:groups #{"sub"}})
        tenant2 (create-tenant {:projects #{"test"}})
        tenant1-user (create-user [tenant1 "sub"])]
    (http (str "/tenants/" tenant2 "/permissions/othertenant")
          {:method :put
           :json {:scopes ["tenant:view"]
                  :principals [{:type "group" :tenant tenant1 :group "sub"}]}})

    (http (str "/tenants/" tenant2 "/projects/test/permissions/othertenant")
          {:method :put
           :json {:scopes ["project:view"]
                  :principals [{:type "group" :tenant tenant1 :group "sub"}]}})

    (binding [*user* tenant1-user]
      (http (str "/tenants/" tenant2 "/projects")
            {:assert-body #{["test"]}}))))

(deftest can't-add-user-as-principal-without-overlapping-group
  (let [tenant1 (create-tenant)
        tenant1-user (create-user [tenant1 "admin"])
        tenant1-user2 (create-user)]
    (binding [*user* tenant1-user]
      (http (str "/tenants/" tenant1 "/permissions/otheruser")
            {:method :put
             :json {:scopes ["tenant:view"]
                    :principals [{:type "user" :userId (tenant1-user2 :id)}]}
             :assert-status NOT_FOUND}))
    (http (str "/tenants/" tenant1 "/permissions/otheruser")
          {:method :put
           :json {:scopes ["tenant:view"]
                  :principals [{:type "user" :userId (tenant1-user2 :id)}]}})))

(deftest can-add-user-as-principal-with-overlapping-group
  (let [tenant1 (create-tenant)
        tenant1-user (create-user [tenant1 "admin"])
        tenant1-user2 (create-user [tenant1 "admin"])
        permission {:scopes ["tenant:view"]
                    :principals [{:type "user" :userId (tenant1-user2 :id)}]}]
    (binding [*user* tenant1-user]
      (http (str "/tenants/" tenant1 "/permissions/otheruser")
            {:method :put
             :json permission})
      (http (str "/tenants/" tenant1 "/permissions/otheruser")
            {:assert-body #{permission}}))))

(deftest can-add-project-as-principal
  (let [tenant1 (create-tenant)
        permission {:scopes ["project:view"]
                    :principals [{:type "project" :tenant tenant1 :project "test1"}]}]
    (http (str "/tenants/" tenant1 "/projects/test1")
          {:method :put})
    (http (str "/tenants/" tenant1 "/projects/test2")
          {:method :put})
    (http (str "/tenants/" tenant1 "/projects/test2/permissions/test")
          {:method :put
           :json permission})
    (http (str "/tenants/" tenant1 "/projects/test2/permissions/test")
          {:assert-body #{permission}})
    (http (str "/tenants/" tenant1 "/projects/test1")
          {:method :delete})
    (http (str "/tenants/" tenant1 "/projects/test2/permissions/test")
          {:assert-status NOT_FOUND})))

(deftest can-add-viz-group-as-principal
  (let [tenant1 (create-tenant)
        permission {:scopes ["project:view"]
                    :principals [{:type "vizGroup" :tenant tenant1 :vizGroup "test1"}]}]
    (http (str "/tenants/" tenant1 "/viz-groups/test1")
          {:method :put})
    (http (str "/tenants/" tenant1 "/projects/test2")
          {:method :put})
    (http (str "/tenants/" tenant1 "/projects/test2/permissions/test")
          {:method :put
           :json permission})
    (http (str "/tenants/" tenant1 "/projects/test2/permissions/test")
          {:assert-body #{permission}})))

(deftest can-add-allowAllAuthenticatedUsers-principal
  (let [tenant (create-tenant)
        permission {:scopes ["tenant:view"]
                    :principals [{:type "allAuthenticatedUsers"}]}]
    (http (str "/tenants/" tenant "/permissions/test")
          {:method :put
           :json permission})
    (http (str "/tenants/" tenant "/permissions/test")
          {:assert-body #{permission}})))

(deftest users-can-see-their-groups
  (let [tenant (create-tenant {:groups ["mygroup" "othergroup"]})]
    (binding [*user* (create-user [tenant "mygroup"])]
      (http (str "/tenants/" tenant "/groups")
            {:assert-body #{["mygroup"]}}))))

(deftest forbidden-view-as-not-found
  ; if you can't "view" it you should not be able to know that it exists by looking for FORBIDDEN
  (let [tenant (create-tenant {:groups #{"foo"}})]
    (binding [*user* (create-user [tenant])]
      (http (str "/tenants/" tenant "/groups/foo")
            {:assert-status NOT_FOUND}))))

;; attributes

(deftest can-add-remove-attributes
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/attributes/color")
          {:method :put :body "red"})
    (http (str "/tenants/" tenant "/attributes/name")
          {:method :put :body "My Cóòl Tȩnânt näme"})
    (http (str "/tenants/" tenant "/attributes")
          {:assert-body #{{:color "red" :name "My Cóòl Tȩnânt näme"}}})
    (http (str "/tenants/" tenant "/attributes")
          {:method :patch
           :json {:color "green" :attri "bute"}
           :assert-body #{{:color "green" :name "My Cóòl Tȩnânt näme" :attri "bute"}}})
    (http (str "/tenants/" tenant "/attributes/color")
          {:method :delete})
    (http (str "/tenants/" tenant "/attributes")
          {:assert-body #{{:name "My Cóòl Tȩnânt näme" :attri "bute"}}})))

(deftest can-patch-null-values
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/attributes/color")
          {:method :put :body "red"})
    (http (str "/tenants/" tenant "/attributes/name")
          {:method :put :body "My Cóòl Tȩnânt näme"})
    (http (str "/tenants/" tenant "/attributes")
          {:method :patch
           :json {:color nil :doesntexist nil :attri "bute"}
           :assert-body #{{:name "My Cóòl Tȩnânt näme" :attri "bute"}}})))

(deftest attribute-management-requires-admin
  (let [tenant (create-tenant)
        user (create-user [tenant])]
    (http (str "/tenants/" tenant "/attributes/color")
          {:method :put :body "red"})

    (binding [*user* user]
      (http (str "/tenants/" tenant "/attributes")
            {:assert-body #{{:color "red"}}})
      (http (str "/tenants/" tenant "/attributes/color")
            {:method :put :body "red" :assert-status FORBIDDEN})
      (http (str "/tenants/" tenant "/attributes")
            {:method :patch
             :json {:color "green" :attri "bute"}
             :assert-status FORBIDDEN})
      (http (str "/tenants/" tenant "/attributes/color")
            {:method :delete :assert-status FORBIDDEN}))))

(deftest invalid-attribute-values
  (let [tenant (create-tenant)
        short-enough-v (->> "🚀" (repeat 255) (apply str))
        too-long-v (->> "a" (repeat 256) (apply str))
        set-attribute (fn [v & {:keys [k] :or {k "color"} :as opts}]
                        (do
                          (http (str "/tenants/" tenant "/attributes/" k)
                                (merge {:method :put :body v} opts))
                          (http (str "/tenants/" tenant "/attributes")
                                (merge
                                 {:method :patch
                                  :json {k v}}
                                 opts))))]
    (set-attribute short-enough-v)
    (set-attribute too-long-v :assert-status BAD_REQUEST)

    (http (str "/tenants/" tenant "/attributes")
          (merge
           {:method :patch
            :json {"k" {}}
            :assert-status BAD_REQUEST}))))

;; public tenant attributes

(deftest can-get-tenant-attributes-without-authentication
  (let [tenant (create-tenant)]
    (http (str "/tenants/" tenant "/attributes/color")
          {:method :put :body "red"})
    (binding [*user* nil]
      (http (str "/public-attributes/" tenant)
            {:assert-body #{{:color "red"}}}))))

(deftest non-existing-tenant-returns-empty-dict
  (binding [*user* nil]
    (http (str "/public-attributes/invalid")
          {:assert-body #{{}}})))

;; sensor-credential

(defn plausible-credential [c]
  (->> c
       ((juxt :username :password))
       (every? (comp not str/blank?))))

(deftest create-delete-credential
  (let [cred-path (str "/tenants/" (create-tenant {:projects #{"p1"}}) "/projects/p1/sensor-credentials/cred1")]
    (http cred-path {:method :put
                     :assert-status OK
                     :assert-body plausible-credential})

    (http cred-path {:method :delete
                     :assert-status NO_CONTENT})))

(deftest rotate-credential
  (let [cred-path (str "/tenants/" (create-tenant {:projects #{"p1"}}) "/projects/p1/sensor-credentials/cred1")]
    (http cred-path {:method :put})

    (http (str cred-path "/rotate")
          {:method :post
           :assert-status OK
           :assert-body plausible-credential})))

;; create dashboards

(deftest create-dashboard-with-action
  (let [tenant (create-tenant {:viz-groups #{"sccon"}})]
    (http (str "/tenants/" tenant "/viz-groups/sccon/create-dashboard")
          {:method :post
           :json {:title "My dashboard title!"}
           :assert-status OK
           :assert-body #{{:slug (str tenant "_sccon_mydashboardtitle")
                           :dashboardName "mydashboardtitle"}}})
    (http (str "/tenants/" tenant "/viz-groups/sccon/dashboards")
          {:method :get
           :assert-status OK
           :assert-body #{["mydashboardtitle"]}})
    (http (str "/tenants/" tenant "/viz-groups/sccon/create-dashboard")
          {:method :post
           :json {:title "My dashboard title!"}
           :assert-status CONFLICT})))

(deftest create-dashboard-needs-dashboard-admin
  (let [tenant (create-tenant {:groups #{"sub"} :viz-groups #{"sccon"}})
        user (create-user [tenant "sub"])
        principals [{:type "group" :tenant tenant :group "sub"}]]
    (http (str "/tenants/" tenant "/viz-groups/sccon/permissions/foo")
          {:method :put
           :json {:scopes ["viz-group:view", "dashboard:view"]
                  :principals principals}})
    (binding [*user* user]
      (http (str "/tenants/" tenant "/viz-groups/sccon/create-dashboard")
            {:method :post
             :json {:title "My dashboard title!"}
             :assert-status FORBIDDEN}))
    (http (str "/tenants/" tenant "/viz-groups/sccon/permissions/foo")
          {:method :put
           :json {:scopes ["viz-group:view", "dashboard:admin"]
                  :principals principals}})
    (binding [*user* user]
      (http (str "/tenants/" tenant "/viz-groups/sccon/dashboards/asdf")
            {:method :put
             :assert-status CREATED})
      (http (str "/tenants/" tenant "/viz-groups/sccon/create-dashboard")
            {:method :post
             :json {:title "My dashboard title!"}
             :assert-status OK
             :assert-body #{{:slug (str tenant "_sccon_mydashboardtitle")
                             :dashboardName "mydashboardtitle"}}}))))

;; sensor-subscription

(deftest create-delete-subscription
  (let [list-path (str "/tenants/" (create-tenant {:projects #{"p1"}}) "/projects/p1/sensor-subscriptions")
        sub-path (str list-path "/sub1")]
    (http sub-path {:method :put
                    :json {:uri "tcp://too.long.topic"
                           :topic (->> "X" (repeat 1000) (apply str))
                           :format "direct"
                           :username "u"
                           :password "p"}
                    :assert-status BAD_REQUEST})

    (http sub-path {:method :put
                    :json {:uri "tcp://missing.credentials"
                           :topic "foo"
                           :format "direct"}
                    :assert-status BAD_REQUEST})

    (http sub-path {:method :put
                    :json {:uri "tcp://number.topic?"
                           :topic 42
                           :format "direct"
                           :username "u"
                           :password "p"}
                    :assert-status BAD_REQUEST})

    (http sub-path {:method :put
                    :json {:uri "tcp://localhost"
                           :topic "t"
                           :format "direct"
                           :username "u"
                           :password "p"}
                    :assert-status CREATED})

    (http list-path {:assert-body #{["sub1"]}})

    (http sub-path {:method :delete
                    :assert-status NO_CONTENT})))

;; published-query

(deftest create-delete-query
  (let [tenant (create-tenant)
        viz-group (doto (str "/tenants/" tenant "/viz-groups/test1")
                    (http {:method :put}))
        list-path (str viz-group "/published-queries")
        query-path (str list-path "/q1")]
    (http query-path {:method :put
                      :json {}
                      :assert-status BAD_REQUEST})

    (http query-path {:method :put
                      :json {:sql 42}
                      :assert-status BAD_REQUEST})

    (http query-path {:method :put
                      :json {:sql "SELECT * FROM sensor_messages"}
                      :assert-status CREATED})

    (http list-path {:assert-body #{["q1"]}})

    (http query-path {:method :delete
                      :assert-status NO_CONTENT})))

;; run tests

(defn cleanup []
  (->> (http "/tenants" {})
       :body
       json-decode
       (filter #(str/starts-with? % resource-prefix))
       (run! #(try (http (str "/tenants/" %)
                         {:method :delete})
                   (catch Exception e (.printStackTrace e))))))

(defn run-tests []
  (let [{:keys [fail error]} (t/run-tests 'test-resources)]
    (if (pos? (+ fail error))
      (System/exit 1)
      (cleanup))))
