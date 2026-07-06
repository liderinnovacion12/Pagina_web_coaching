import { createClient } from "@supabase/supabase-js";

export async function seedAdmin({ email, password, supabaseUrl, serviceRoleKey }) {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw new Error(`No se pudo crear el usuario admin: ${error.message}`);
  }

  const { error: updateError } = await supabase
    .from("usuarios")
    .update({ rol: "admin" })
    .eq("id", data.user.id);

  if (updateError) {
    throw new Error(`No se pudo promover el rol admin: ${updateError.message}`);
  }
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!email || !password || !supabaseUrl || !serviceRoleKey) {
    console.error(
      "Faltan variables: ADMIN_EMAIL, ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  await seedAdmin({ email, password, supabaseUrl, serviceRoleKey });
  console.log(`Usuario admin creado: ${email}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
