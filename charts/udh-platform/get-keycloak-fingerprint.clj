(ns net.teuto.udh.sync.kcfingerprint
  (:require [cheshire.core :as json]
            [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.java.shell :as shell]
            [babashka.http-client :as http])
  (:import [java.security KeyStore]
           [java.security.cert CertificateFactory]
           [javax.net.ssl TrustManagerFactory SSLContext]))

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

(def client (http/client (when-let [ca (System/getenv "CA_BUNDLE")]
                           {:ssl-context
                            (create-ssl-context ca)})))

(let [url (str "https://"
               (System/getenv "KEYCLOAK_DOMAIN")
               "/realms/udh/protocol/openid-connect/certs")
      result (http/get url {:client client})
      json (json/parse-string (result :body) true)
      cert (->> json
                :keys
                (filter #(-> % :use #{"sig"}))
                first
                :x5c
                first
                (format "-----BEGIN CERTIFICATE-----\n%s\n-----END CERTIFICATE-----"))
      fingerprint (-> (shell/sh "openssl" "x509" "-fingerprint" "-noout" :in cert)
                      :out
                      (str/replace #".*=|[:\n]" ""))]
  (spit "/fingerprint/fp" fingerprint))