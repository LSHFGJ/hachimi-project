import { error } from "@sveltejs/kit";
import { put } from "@vercel/blob";

export const actions = {
    upload: async ({ request }) => {
        const form = await request.formData();
        const files = form.getAll("file") as File[];

        if (!files || files.length === 0) {
            throw error(400, { message: "No file to upload." });
        }

        const uploadedUrls = [];

        try {
            for (const file of files) {
                // Use the original filename as the pathname
                const { url } = await put(file.name, file, { access: "public" });
                uploadedUrls.push(url);
            }
            return { uploaded: uploadedUrls };
        } catch (err) {
            console.error("Upload failed", err);
            return { error: "Upload failed: " + err.message };
        }
    },
};
