import { index, prefix, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('./home/page.tsx'),
  route('about', './about/page.tsx'),
  route('auth', './auth/page.tsx'),
  route('freeplay', './freeplay/page.tsx'),
  route('play', './play/page.tsx'),
  route('songs', './songs/page.tsx'),
  route('training', './training/page.tsx'),
  ...prefix('training', [
    route('phrases', './training/phrases/page.tsx'),
    route('speed', './training/speed/page.tsx'),
  ]),
] satisfies RouteConfig
