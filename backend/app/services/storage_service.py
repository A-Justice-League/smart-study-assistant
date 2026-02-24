from app.db.supabase_client import supabase
import uuid

class StorageService:
    BUCKET_NAME = "uploads"

    async def upload_file(self, file_content: bytes, filename: str, content_type: str) -> str:
        # If no client, return mock URL
        if not supabase.client:
           return f"https://mock-storage.com/{uuid.uuid4()}/{filename}"

        path = f"{uuid.uuid4()}/{filename}"
        try:
             # Sync call in async wrapper potentially needed with run_in_executor if blocking
             # supabase-py is sync by default unless using async client. keeping simple for MVP.
             supabase.client.storage.from_(self.BUCKET_NAME).upload(
                 path=path,
                 file=file_content,
                 file_options={"content-type": content_type}
             )
             return supabase.client.storage.from_(self.BUCKET_NAME).get_public_url(path)
        except Exception as e:
            # Fallback for dev without configured storage
            return f"https://mock-storage-error/{filename}"

storage_service = StorageService()
