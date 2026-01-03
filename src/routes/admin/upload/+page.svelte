<script lang="ts">
    import { enhance } from "$app/forms";
    export let form;
</script>

<div class="upload-container">
    <h1>Upload Assets to Vercel Blob</h1>

    <form
        use:enhance
        action="?/upload"
        method="POST"
        enctype="multipart/form-data"
        class="upload-form"
    >
        <div class="form-group">
            <label for="file">Select File(s)</label>
            <input type="file" name="file" id="file" required multiple />
        </div>
        <button type="submit">Upload</button>
    </form>

    {#if form}
        <div class="result">
            {#if form.uploaded}
                <h2>Upload Success</h2>
                <div class="uploaded-list">
                    {#if Array.isArray(form.uploaded)}
                        {#each form.uploaded as url}
                            <p><a href={url} target="_blank">{url}</a></p>
                        {/each}
                    {:else}
                        <p>
                            <a href={form.uploaded} target="_blank"
                                >{form.uploaded}</a
                            >
                        </p>
                    {/if}
                </div>
            {:else if form.error}
                <p class="error">{form.error}</p>
            {/if}
        </div>
    {/if}
</div>

<style>
    .upload-container {
        max-width: 800px;
        margin: 40px auto;
        padding: 20px;
        font-family: sans-serif;
    }
    .upload-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    button {
        padding: 10px 20px;
        background: #000;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    .result {
        margin-top: 20px;
        padding: 20px;
        background: #f5f5f5;
        border-radius: 8px;
        word-break: break-all;
    }
    .error {
        color: red;
    }
</style>
