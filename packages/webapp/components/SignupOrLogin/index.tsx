import { auth } from '@clerk/nextjs/server';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { getSupabaseClient } from '@/lib/supabase';

/** Create a new Users table record, if needed, for the currently logged-in user. */
export async function createUser() {
  const { userId, getToken } = auth();
  if (!userId) {
    return;
  }
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.from('Users').upsert({}).eq('id', userId).select('*');
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

export async function SignupOrLogin({ text }: { text?: string }) {
  await createUser();
  return (
    <>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-mono text-primary-foreground hover:bg-primary/90">
            {text || 'Sign in'}
          </button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
