package net.teuto.udh

import aws.sdk.kotlin.runtime.AwsServiceException
import aws.sdk.kotlin.runtime.auth.credentials.EnvironmentCredentialsProvider
import aws.sdk.kotlin.services.iam.*
import aws.sdk.kotlin.services.iam.model.AccessKey
import aws.sdk.kotlin.services.s3.S3Client
import aws.sdk.kotlin.services.s3.model.BucketAlreadyExists
import aws.sdk.kotlin.services.s3.model.CreateBucketRequest
import aws.sdk.kotlin.services.s3.model.DeleteBucketRequest
import aws.sdk.kotlin.services.s3.model.PutBucketPolicyRequest
import aws.sdk.kotlin.services.s3.model.S3Exception
import aws.smithy.kotlin.runtime.net.url.Url
import com.fasterxml.jackson.databind.ObjectMapper
import kotlinx.coroutines.runBlocking
import org.keycloak.representations.IDToken

fun setClaimBuckets(ctx: AuthzContext, token: IDToken) {
    val writeProjectBucketNames = getResourcesForUser(ctx, PROJECT_TYPE, emptyMap(), listOf("bucket-write")).map {
        it.getResourceModel().flatName
    }
    val readProjectBucketNames = getResourcesForUser(ctx, PROJECT_TYPE, emptyMap(), listOf("bucket-read")).map {
        it.getResourceModel().flatName
    }.filterNot(writeProjectBucketNames.toSet()::contains)

    val writeBucketNames =
        writeProjectBucketNames + getResourcesForUser(ctx, CITYTOOL_TYPE, emptyMap(), listOf(ADMIN_SCOPE)).map {
            it.getResourceModel().bucketName
        }
    token.setOtherClaims(
        "https://aws.amazon.com/tags", listOf(
            mapOf(
                "principal_tags" to mapOf(
                    "bucketread" to readProjectBucketNames,
                    "bucket" to writeBucketNames
                )
            )
        )
    )
}

fun bucketClient(): S3Client? {
    return System.getenv("BUCKET_ENDPOINT")?.let {
        S3Client {
            endpointUrl = Url.parse(it)
            region = "none"
            credentialsProvider = EnvironmentCredentialsProvider()
        }
    }
}

fun createBucketForCitytool(citytool: UdhCitytool) {
    bucketClient()?.use {
        runBlocking {
            val createBucketRequest = CreateBucketRequest { bucket = citytool.bucketName }
            it.createBucket(createBucketRequest)
            it.putBucketPolicy(PutBucketPolicyRequest {
                bucket = createBucketRequest.bucket
                policy = ObjectMapper().writeValueAsString(
                    mapOf(
                        "Version" to "2012-10-17",
                        "Statement" to
                                listOf(
                                    mapOf(
                                        "Action" to listOf(
                                            "s3:ListBucket",
                                            "s3:GetObject",
                                            "s3:PutObject",
                                            "s3:DeleteObject"
                                        ),
                                        "Effect" to "Allow",
                                        "Resource" to listOf("arn:aws:s3:::*", "arn:aws:s3:::*/*"),
                                        "Principal" to mapOf("AWS" to listOf("arn:aws:sts:::assumed-role/usercode/usercode")),
                                        "Condition" to mapOf("StringEquals" to mapOf("aws:PrincipalTag/bucket" to createBucketRequest.bucket))
                                    ),
                                    mapOf(
                                        "Action" to listOf("s3:GetObject"),
                                        "Effect" to "Allow",
                                        "Resource" to listOf("arn:aws:s3:::${createBucketRequest.bucket}/*"),
                                        "Principal" to "*"
                                    )
                                )
                    )
                )
            })
        }
    }
}

fun deleteBucketForCitytool(citytool: UdhCitytool) {
    try {
        bucketClient()?.use { runBlocking { it.deleteBucket(DeleteBucketRequest { bucket = citytool.bucketName }) } }
    } catch (e: S3Exception) {
        if (e.sdkErrorMetadata.errorCode != "BucketNotEmpty") throw e
    }
}

fun putBucketPolicy(project: UdhProject) {
    LOGGER.debug("creating bucket policy for ${project.flatName}")
    bucketClient()?.use {
        runBlocking {
            it.putBucketPolicy(PutBucketPolicyRequest {
                bucket = project.flatName
                policy = ObjectMapper().writeValueAsString(
                    mapOf(
                        "Version" to "2012-10-17",
                        "Statement" to
                                listOf(
                                    mapOf(
                                        "Action" to listOf(
                                            "s3:ListBucket",
                                            "s3:GetObject"
                                        ),
                                        "Effect" to "Allow",
                                        "Resource" to listOf("arn:aws:s3:::*", "arn:aws:s3:::*/*"),
                                        "Principal" to mapOf("AWS" to listOf("arn:aws:sts:::assumed-role/usercode/usercode")),
                                        "Condition" to mapOf("StringEquals" to mapOf("aws:PrincipalTag/bucketread" to project.flatName))
                                    ),
                                    mapOf(
                                        "Action" to listOf(
                                            "s3:ListBucket",
                                            "s3:GetObject",
                                            "s3:PutObject",
                                            "s3:DeleteObject"
                                        ),
                                        "Effect" to "Allow",
                                        "Resource" to listOf("arn:aws:s3:::*", "arn:aws:s3:::*/*"),
                                        "Principal" to mapOf("AWS" to listOf("arn:aws:sts:::assumed-role/usercode/usercode")),
                                        "Condition" to mapOf("StringEquals" to mapOf("aws:PrincipalTag/bucket" to project.flatName))
                                    ),
                                    mapOf(
                                        "Action" to listOf("s3:GetObject"),
                                        "Effect" to "Allow",
                                        "Resource" to listOf("arn:aws:s3:::${project.flatName}/_public/*"),
                                        "Principal" to "*"
                                    )
                                )
                    )
                )
            })
        }
    }
}

fun createBucket(project: UdhProject) {
    LOGGER.debug("creating bucket for ${project.flatName}")
    bucketClient()?.use {
        runBlocking {
            val createBucketRequest = CreateBucketRequest { bucket = project.flatName }
            try {
                it.createBucket(createBucketRequest)
            } catch(_: BucketAlreadyExists) {
                // ignore
            }
            putBucketPolicy(project)
        }
    }
}

fun deleteBucket(project: UdhProject) {
    try {
        bucketClient()?.use { runBlocking { it.deleteBucket(DeleteBucketRequest { bucket = project.flatName }) } }
    } catch (e: S3Exception) {
        if (e.sdkErrorMetadata.errorCode != "BucketNotEmpty") throw e
    }
}

fun bucketUserClient(): IamClient? {
    return System.getenv("BUCKET_ENDPOINT")?.let {
        IamClient {
            endpointUrl = Url.parse(it)
            region = "none"
            credentialsProvider = EnvironmentCredentialsProvider()
        }
    }
}

private const val POLICY_PROJECTBUCKET = "projectbucket"

fun replaceBucketUser(project: UdhProject): AccessKey? {
    try {
        deleteBucketUser(project) //
    } catch (e: AwsServiceException) {
        // most likely did not exist, if there is something fundamentally wrong we'll get an exception during creation
    }

    return bucketUserClient()?.use {
        runBlocking {
            it.createUser { userName = project.flatName }
            it.putUserPolicy {
                userName = project.flatName
                policyName = POLICY_PROJECTBUCKET
                policyDocument = ObjectMapper().writeValueAsString(
                    mapOf(
                        "Version" to "2012-10-17",
                        "Statement" to
                                listOf(
                                    mapOf(
                                        "Action" to listOf("s3:GetObject"),
                                        "Effect" to "Allow",
                                        "Resource" to listOf("arn:aws:s3:::${project.flatName}/*"),
                                    ),
                                )
                    )
                )
            }
            it.createAccessKey { userName = project.flatName }.accessKey
        }
    }
}

fun deleteBucketUser(project: UdhProject) {
    val user = project.flatName
    try {
        bucketUserClient()?.use { client ->
            runBlocking {
                client.listAccessKeys { userName = user }.accessKeyMetadata.forEach {
                    client.deleteAccessKey {
                        userName = user
                        accessKeyId = it.accessKeyId
                    }
                }
                client.deleteUserPolicy {
                    userName = user
                    policyName = POLICY_PROJECTBUCKET
                }
                client.deleteUser { userName = user }
            }
        }
    } catch (e: S3Exception) {
        if (e.sdkErrorMetadata.errorCode != "NoSuchEntity") throw e
    }
}