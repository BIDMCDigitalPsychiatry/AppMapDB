import * as u from '@virtuoso.dev/urx'
import { domIOSystem } from './domIOSystem'
import { UP, DOWN, ScrollDirection } from './stateFlagsSystem'
import { tupleComparator } from './comparators'

export type NumberTuple = [number, number]
export type Overscan = number | { main: number; reverse: number }
export const TOP = 'top' as const
export const BOTTOM = 'bottom' as const
export const NONE = 'none' as const
export type ListEnd = typeof TOP | typeof BOTTOM
export type ViewportIncrease = number | { [k in ListEnd]?: number }
export type ChangeDirection = typeof UP | typeof DOWN | typeof NONE

export function getOverscan(overscan: Overscan, end: ListEnd, direction: ScrollDirection) {
  if (typeof overscan === 'number') {
    return (direction === UP && end === TOP) || (direction === DOWN && end === BOTTOM) ? overscan : 0
  } else {
    if (direction === UP) {
      return end === TOP ? overscan.main : overscan.reverse
    } else {
      return end === BOTTOM ? overscan.main : overscan.reverse
    }
  }
}

function getViewportIncrease(value: ViewportIncrease, end: ListEnd) {
  return typeof value === 'number' ? value : value[end] || 0
}

export const sizeRangeSystem = u.system(
  ([{ scrollTop, viewportHeight, deviation, headerHeight }]) => {
    const listBoundary = u.stream<NumberTuple>()
    const topListHeight = u.statefulStream(0)
    const fixedHeaderHeight = u.statefulStream(0)
    const increaseViewportBy = u.statefulStream<ViewportIncrease>(0)
    const overscan = u.statefulStream<Overscan>(0)

    const visibleRange = (u.statefulStreamFromEmitter(
      u.pipe(
        u.combineLatest(
          u.duc(scrollTop),
          u.duc(viewportHeight),
          u.duc(headerHeight),
          u.duc(overscan),
          u.duc(fixedHeaderHeight),
          u.duc(deviation),
          u.duc(increaseViewportBy)
        ),
        u.map(([scrollTop, viewportHeight, headerHeight, overscan, fixedHeaderHeight, deviation, increaseViewportBy]) => {
          const top = scrollTop - deviation
          const headerVisible = Math.max(headerHeight - top, 0)
          let direction: ChangeDirection = NONE
          const topViewportAddition = getViewportIncrease(increaseViewportBy, TOP)
          const bottomViewportAddition = getViewportIncrease(increaseViewportBy, BOTTOM)
          return [
            Math.max(top - headerHeight - getOverscan(overscan, TOP, direction) - topViewportAddition, 0),
            top - headerVisible - fixedHeaderHeight + viewportHeight + getOverscan(overscan, BOTTOM, direction) + bottomViewportAddition,
          ]
        }),
        u.distinctUntilChanged(tupleComparator as any)
      ),
      [0, 0]
    ) as unknown) as u.StatefulStream<NumberTuple>

    return {
      // input
      listBoundary,
      overscan,
      topListHeight,
      fixedHeaderHeight,
      increaseViewportBy,

      // output
      visibleRange,
    }
  },
  u.tup(domIOSystem),
  { singleton: true }
)