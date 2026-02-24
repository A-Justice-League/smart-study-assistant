from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class SupabaseClientWrapper:
    _client: Client = None

    @property
    def client(self) -> Client:
        if self._client is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
                logger.warning("Supabase credentials not set. Database operations will fail.")
                # We return a dummy or raise error depending on strategy. 
                # For runnable scaffold, we'll log warning.
            try:
                self._client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                raise
        return self._client

supabase = SupabaseClientWrapper()
mnemonics = {} # Mock DB for minimal runnability if Supabase fails? No, simpler to stick to Supabase.
