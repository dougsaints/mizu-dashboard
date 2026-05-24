// PageHeader — Phase 14-02.
// Header leve pra cada page do app multi-página.
// Não confundir com SectionHeader (que vive dentro de cada section com source pill + export PNG).

type Props = {
  title: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <header className="page-header">
      <h1 className="page-header-title">{title}</h1>
      {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
    </header>
  )
}
