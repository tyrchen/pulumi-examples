import * as aws from "@pulumi/aws";
import * as sharp from "sharp";

const bucket = new aws.s3.Bucket("images");

export const bucketName = bucket.id;

bucket.onObjectCreated("onImgUploaded", async bucketArgs => {
    console.log("onImgUploaded called");
    const width = 240;
    const height = 240;
    if (!bucketArgs.Records) return;

    const s3 = new aws.sdk.S3();
    for (const rec of bucketArgs.Records) {
        const [buck, key] = [rec.s3.bucket.name, rec.s3.object.key];
        if (key.startsWith("processed")) continue;
        console.log(`Processing: file ${key}`);

        const data = await s3.getObject({ Bucket: buck, Key: key }).promise();
        if (!data.Body) continue;

        const result = await sharp(data.Body as Buffer)
            .resize({
                width,
                height,
                fit: sharp.fit.cover,
                position: sharp.strategy.attention,
            })
            .jpeg()
            .toBuffer();
        const newFile = `processed/${key}`;
        await s3.putObject({
            Bucket: buck,
            Key: newFile,
            Body: result,
        }).promise();
        console.log(`cropped and resized image ${newFile}`);
    }
});
