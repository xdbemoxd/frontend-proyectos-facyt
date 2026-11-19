type PagePlaceholderProps = {
  title: string;
  description: string;
};

/** Pagina provisional para secciones del menu que aun no estan hechas. */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <main className="p-6">
      <h1 className="font-heading text-2xl font-medium">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Sección en construcción.
      </div>
    </main>
  );
}
