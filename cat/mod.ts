const { args } = Deno;

for (let i = 1; i < args.length; i++) {
  const filename = args[i];
  const file = await Deno.open(filename);

  await Deno.copy(Deno.stdout, file);

  file.close();
}
