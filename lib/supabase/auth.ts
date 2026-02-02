import { createClient } from '@/lib/supabase/server';

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Fetch user profile for role and additional info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      ...user,
      profile,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export async function getCurrentUserOrRedirect() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
