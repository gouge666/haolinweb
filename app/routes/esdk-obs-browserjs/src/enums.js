const o = {}
o.AclPrivate = 'private';
o.AclPublicRead = 'public-read';
o.AclPublicReadWrite = 'public-read-write';
o.AclPublicReadDelivered = 'public-read-delivered';
o.AclPublicReadWriteDelivered = 'public-read-write-delivered';
o.AclAuthenticatedRead = 'authenticated-read';
o.AclBucketOwnerRead = 'bucket-owner-read';
o.AclBucketOwnerFullControl = 'bucket-owner-full-control';
o.AclLogDeliveryWrite = 'log-delivery-write';

o.StorageClassStandard = 'STANDARD';
o.StorageClassWarm = 'WARM';
o.StorageClassCold = 'COLD';
o.StorageClassDeepArchive = 'DEEP_ARCHIVE';
o.StorageClassIntelligentTiering = 'INTELLIGENT_TIERING';

o.PermissionRead = 'READ';
o.PermissionWrite = 'WRITE';
o.PermissionReadAcp = 'READ_ACP';
o.PermissionWriteAcp = 'WRITE_ACP';
o.PermissionFullControl = 'FULL_CONTROL';

o.GroupAllUsers = 'AllUsers';
o.GroupAuthenticatedUsers = 'AuthenticatedUsers';
o.GroupLogDelivery = 'LogDelivery';

o.RestoreTierExpedited = 'Expedited';
o.RestoreTierStandard = 'Standard';
o.RestoreTierBulk = 'Bulk';

o.GranteeGroup = 'Group';
o.GranteeUser = 'CanonicalUser';

o.CopyMetadata = 'COPY';
o.ReplaceMetadata = 'REPLACE';

o.EventObjectCreatedAll = 'ObjectCreated:*';
o.EventObjectCreatedPut = 'ObjectCreated:Put';
o.EventObjectCreatedPost = 'ObjectCreated:Post';
o.EventObjectCreatedCopy = 'ObjectCreated:Copy';
o.EventObjectCreatedCompleteMultipartUpload = 'ObjectCreated:CompleteMultipartUpload';
o.EventObjectRemovedAll = 'ObjectRemoved:*';
o.EventObjectRemovedDelete = 'ObjectRemoved:Delete';
o.EventObjectRemovedDeleteMarkerCreated = 'ObjectRemoved:DeleteMarkerCreated';

o.ContentMD5 = 'Content-MD5';
o.ContentSHA256 = 'Content-SHA256';

export default o