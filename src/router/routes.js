const routes = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        redirect: '/home',
      },
      {
        path: 'home/',
        name: 'home',
        component: () => import('pages/home.vue'),
        meta: {
          title: 'Homepage',
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/login.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('pages/register.vue'),
  },
]

export default routes
