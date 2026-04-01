const { S3Client, ListObjectsV2Command, ListBucketsCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  endpoint: 'https://s3.perfil.plus',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'KJ<?k53Q8XG5Tj5sV2CXe}R4t$*ZgVBi'
  },
  forcePathStyle: true,
});

async function listAll() {
  try {
    const bucketsResponse = await s3.send(new ListBucketsCommand({}));
    console.log("All buckets:");
    bucketsResponse.Buckets.forEach(b => console.log(`- ${b.Name}`));
    
    // Check specific bucket
    const target = 'soydeborasoysaludable-public';
    console.log(`\n\nChecking EVERYTHING inside: ${target}`);
    const command = new ListObjectsV2Command({ Bucket: target });
    const response = await s3.send(command);
    const objects = await s3.send(new ListObjectsV2Command({ Bucket: 'soydeborasoysaludable-public', Prefix: 'landings/' }));
    console.log('Landings in soydeborasoysaludable-public:');
    objects.Contents.forEach(obj => {
        console.log(` - ${obj.Key} (${obj.Size} bytes)`);
    });
  } catch (e) {
    console.log(`Error:`, e.message);
  }
}

listAll().catch(console.error);
