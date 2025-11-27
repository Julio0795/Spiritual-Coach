export interface SpiritualMaster {
  readonly id: string
  readonly name: string
  readonly tradition: string
  readonly description: string
  readonly quote: string
}

export const SPIRITUAL_MASTERS: readonly SpiritualMaster[] = [
  {
    id: 'rumi',
    name: 'Rumi',
    tradition: 'Sufism',
    description:
      'A 13th-century Persian poet and mystic who emphasized the transformative power of divine love. His teachings guide seekers to find the sacred within the ordinary and to see every experience as a gateway to the divine.',
    quote: 'The wound is the place where the Light enters you.',
  },
  {
    id: 'marcus-aurelius',
    name: 'Marcus Aurelius',
    tradition: 'Stoicism',
    description:
      'A Roman emperor and philosopher who championed resilience through logic and self-discipline. His meditations teach us to focus on what we can control, accept what we cannot, and maintain inner peace regardless of external circumstances.',
    quote: 'You have power over your mind - not outside events.',
  },
  {
    id: 'carl-jung',
    name: 'Carl Jung',
    tradition: 'Analytical Psychology',
    description:
      'A Swiss psychiatrist who pioneered the exploration of the unconscious mind and shadow work. His insights help us integrate our hidden aspects, understand our deeper motivations, and transform our relationship with ourselves.',
    quote:
      'Until you make the unconscious conscious, it will direct your life and you will call it fate.',
  },
  {
    id: 'eckhart-tolle',
    name: 'Eckhart Tolle',
    tradition: 'Modern Spirituality',
    description:
      'A contemporary spiritual teacher who emphasizes the power of presence and mindfulness. His teachings help us break free from the tyranny of past regrets and future anxieties by anchoring ourselves in the eternal now.',
    quote: 'Realize deeply that the present moment is all you have.',
  },
  {
    id: 'jesus',
    name: 'Jesus',
    tradition: 'Christianity',
    description:
      'A central figure in Christianity whose teachings center on forgiveness, compassion, and unconditional love. His message transcends religious boundaries, offering a path of radical kindness and transformative grace.',
    quote: 'Love your enemies and pray for those who persecute you.',
  },
] as const

