import html2canvas from 'html2canvas'

export async function exportSectionAsPng(
  sectionEl: HTMLElement,
  filename: string,
): Promise<void> {
  const canvas = await html2canvas(sectionEl, {
    backgroundColor: '#FFFCF3',
    scale: 2,
    logging: false,
    useCORS: true,
  })
  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function safeFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const date = new Date().toISOString().slice(0, 10)
  return `mizu-${slug}-${date}.png`
}
