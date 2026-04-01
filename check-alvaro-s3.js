const { S3Client, ListObjectsV2Command, HeadBucketCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  endpoint: 'https://s3.perfil.plus',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'KJ<?k53Q8XG5Tj5sV2CXe}R4t$*ZgVBi'
  },
  forcePathStyle: true,
});

async function checkAlvaro() {
  const bucket = 'alvarolondono-public';
  console.log(`Checking bucket: ${bucket}`);
  
  try {
    // Check if bucket exists
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`Bucket ${bucket} exists.`);
    
    const command = new ListObjectsV2Command({ Bucket: bucket, Prefix: 'landings/' });
    const response = await s3.send(command);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log("No objects found in", bucket);
    } else {
      response.Contents.forEach(item => console.log(` - ${item.Key} (${item.Size} bytes)`));
    }
  } catch (e) {
    console.log(`Error reading bucket ${bucket}:`, e.message);
  }
}

checkAlvaro().catch(console.error);
