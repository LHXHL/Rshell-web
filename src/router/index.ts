import {createRouter, createWebHistory} from 'vue-router'
import {cancelRequest} from "@/utils/request";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/',
            name: 'Main',
            component: () => import('@/views/HomeView.vue'),
            children: [
                {
                    path: '/home',
                    name: 'Home',
                    meta: {title: 'nav.home', permiss: '1'},
                    component: () => import('@/views/home/index.vue')
                },
                {
                    path: '/Clients',
                    name: 'Clients',
                    meta: {title: 'nav.clients', permiss: '2'},
                    component: () => import('@/views/clients/ClientsView.vue')
                },
                {
                    path: '/Listeners',
                    name: 'Listeners',
                    meta: {title: 'nav.listeners', permiss: '2'},
                    component: () => import('@/views/listener/listener.vue')
                },
                {
                    path: '/Server',
                    name: 'Server',
                    meta: {title: 'nav.generate', permiss: '5'},
                    component: () => import('@/views/server/ServerGen.vue')
                },
                {
                    path: '/WebDelivery',
                    name: 'WebDelivery',
                    meta: {title: 'nav.webdelivery', permiss: '5'},
                    component: () => import('@/views/server/WebDelivery.vue')
                },
                {
                    path: '/Settings',
                    name: 'Settings',
                    meta: {title: 'nav.settings', permiss: '5'},
                    component: () => import('@/views/settings/Settings.vue')
                },
                {
                    path: '/Plugins',
                    name: 'Plugins',
                    meta: {title: 'nav.plugins', permiss: '5'},
                    component: () => import('@/views/plugin/PluginView.vue')
                },
            ]
        },
        {
            path: '/client',
            name: '客户端详情',
            meta: {title: 'nav.clientDetail', permiss: '2'},
            component: () => import('@/views/client/ClientView.vue'),
            children: [
                {
                    path: '/client/shell',
                    name: 'Shell',
                    meta: {title: 'nav.shell'},
                    component: () => import('@/views/client/View/ClientShell.vue')
                },
                {
                    path: '/client/socks5',
                    name: 'Socks5',
                    meta: {title: 'nav.socks5'},
                    component: () => import('@/views/client/View/ClientSocks5.vue')
                },
                {
                    path: '/client/files',
                    name: 'Files',
                    meta: {title: 'nav.files'},
                    component: () => import('@/views/client/View/ClientFiles.vue')
                },
                {
                    path: '/client/pid',
                    name: 'PID',
                    meta: {title: 'nav.pid'},
                    component: () => import('@/views/client/View/ClientPid.vue')
                },
                {
                    path: '/client/downloads',
                    name: 'Downloads',
                    meta: {title: 'nav.downloads'},
                    component: () => import('@/views/client/View/ClientDownloads.vue')
                },
                {
                    path: '/client/notes',
                    name: 'Notes',
                    meta: {title: 'nav.notes'},
                    component: () => import('@/views/client/View/ClientNotes.vue')
                },
                {
                    path: '/client/screenshots',
                    name: 'Screenshots',
                    meta: {title: 'nav.screenshots'},
                    component: () => import('@/views/client/View/ClientScreenshots.vue')
                },
                {
                    path: '/client/credentials',
                    name: 'Credentials',
                    meta: {title: 'nav.credentials'},
                    component: () => import('@/views/client/View/ClientCredentials.vue')
                },
                {
                    path: '/client/sensitive-search',
                    name: 'SensitiveSearch',
                    meta: {title: 'nav.sensitive'},
                    component: () => import('@/views/client/View/ClientSensitiveSearch.vue')
                },
                {
                    path: '/client/browser-dump',
                    name: 'BrowserDump',
                    meta: {title: 'nav.browserdump'},
                    component: () => import('@/views/client/View/ClientBrowserDump.vue')
                },
            ]
        },
        {
            path: '/login',
            name: '登陆',
            meta: {title: 'nav.login'},
            component: () => import('@/views/login/LoginView.vue')
        },
        {
            path: '/user/resetpassword',
            name: '重置密码',
            meta: {title: 'nav.resetPassword', permiss: '1'},
            component: () => import('@/views/user/ResetPassword.vue')
        },
        {
            path: '/404',
            name: '404',
            meta: {title: '404'},
            component: () => import('@/views/error/404View.vue')
        },
        {
            path: '/401',
            name: '401',
            meta: {title: '401'},
            component: () => import('@/views/error/401View.vue')
        },
    ]
})

export default router
