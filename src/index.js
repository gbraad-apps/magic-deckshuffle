import { render } from 'react-dom'
import React, { useState } from 'react'
import { useSprings, animated, interpolate } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import './styles.css'

const cards = [
  'https://media.wizards.com/2019/eld/en_M2Ztp4qnSK.png',
  'https://media.wizards.com/2019/eld/en_d5yPScT1Mm.png',
  'https://media.wizards.com/2019/eld/en_sdpNmkspqN.png',
  'https://media.wizards.com/2019/eld/en_Xbklmo60Cb.png',
  'https://media.wizards.com/2019/eld/en_bMNI9QNLAV.png',
  'https://media.wizards.com/2019/eld/en_rbvLMCAiZE.png',
  'https://media.wizards.com/2019/eld/en_PbWFx0Qu0n.png'
]

const to = (i) => ({ x: 0, y: i * -4, scale: 1, rot: 0, delay: i * 100 })
const from = (i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })
const trans = (r, s) => `rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

function Deck() {
  const [gone] = useState(() => new Set()) // The set flags all the cards that are flicked out
  const [props, set] = useSprings(cards.length, (i) => ({ ...to(i), from: from(i) })) // Create a bunch of springs using the helpers above
  
  const bind = useGesture(({ args: [index], down, delta: [xDelta], distance, direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2
    const dir = xDir < 0 ? -1 : 1
    if (!down && trigger) gone.add(index)
    set((i) => {
      if (index !== i) return
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? xDelta : 0
      const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0)
      const scale = down ? 1.6 : 1.5
      return { x, rot, scale, delay: undefined, config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 } }
    })
    if (!down && gone.size === cards.length) setTimeout(() => gone.clear() || set((i) => to(i)), 600)
  })
  
  return props.map(({ x, y, rot, scale }, i) => (
    <animated.div key={i} style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}>
      <animated.div {...bind(i)} style={{ transform: interpolate([rot, scale], trans), backgroundImage: `url(${cards[i]})` }} />
    </animated.div>
  ))
}

render(<Deck />, document.getElementById('root'))
