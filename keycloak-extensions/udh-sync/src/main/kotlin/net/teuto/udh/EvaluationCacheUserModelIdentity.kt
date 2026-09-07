package net.teuto.udh

import org.keycloak.authorization.identity.UserModelIdentity
import org.keycloak.authorization.model.Resource
import org.keycloak.authorization.model.Scope
import org.keycloak.models.RealmModel
import org.keycloak.models.UserModel
import kotlin.collections.set

class EvaluationCacheUserModelIdentity(realm: RealmModel, user: UserModel) : UserModelIdentity(realm, user) {
    // resourceid:scopes to result
    val evaluationCache = mutableMapOf<String, Boolean>()

    private fun getCacheKey(resource: Resource, scopes: Collection<String>): String {
        return "${resource.id}:${scopes.joinToString(",")}"
    }

    fun recordEvaluation(resource: Resource, scopes: Collection<String>, allowed: Boolean) {
        evaluationCache[getCacheKey(resource, scopes)] = allowed
    }

    fun getCachedResult(resource: Resource, scopes: Collection<String>): Boolean? {
        return evaluationCache[getCacheKey(resource, scopes)]
    }
}