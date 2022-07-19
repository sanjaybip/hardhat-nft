import pinataSDK from "@pinata/sdk";
import path from "path";
import fs from "fs";
import "dotenv/config";

const pinataApiKey = process.env.PINATA_API_KEY || "";
const pinataApiSecret = process.env.PINATA_API_SECRET || "";
const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

export async function storeImages(imagesPath: string) {
    const fullImagePath = path.resolve(imagesPath);
    const files = fs.readdirSync(fullImagePath);
    let responses = [];
    for (const fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(
            `${fullImagePath}/${files[fileIndex]}`
        );
        try {
            console.log(`Uploading to IPFS using PINATA`);

            const response = await pinata.pinFileToIPFS(readableStreamForFile);
            responses.push(response);
        } catch (e) {
            console.log(e);
        }
    }
    return { responses, files };
}

export async function storeTokeUriMetadata(metadata: Object) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata);
        return response;
    } catch (e) {
        console.log(e);
    }
    return null;
}
