import {NbMenuItem} from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Artworks',
    icon: 'icon-ic_artworks',
    link: '/pages/artworks/all'
  },
  {
    title: 'Art storages',
    icon: 'icon-ic_artstorage-2',
    link: '/pages/art-storages'
  },
  {
    title: 'File storage',
    icon: 'icon-ic_file-storage',
    link: '/pages/file-storage'
  },
  {
    title: 'Templates',
    icon: 'icon-ic_templates-1',
    link: '/pages/templates'
  },
  {
    title: 'Consignment',
    icon: 'icon-ic_commissions',
    link: '/pages/consignment'
  },
  {
    title: 'Communication',
    icon: 'icon-ic_communication',
    link: '/pages/communication'
  },
  {
    title: 'Contacts',
    icon: 'icon-ic_contacts',
    link: '/pages/contacts'
  },
  {
    title: 'Exhibitions',
    icon: 'icon-ic_exhibition',
    link: '/pages/exhibitions'
  },
  {
    title: 'My CV',
    icon: 'icon-ic_contacts-1',
    link: '/pages/cv',
    children: [
      {
        title: 'Educations',
        link: '/pages/cv/educations',
      },
      {
        title: 'Solo Exhibitions',
        link: '/pages/cv/solo-exhibitions',
      },
      {
        title: 'Group Exhibitions',
        link: '/pages/cv/group-exhibitions',
      },
      {
        title: 'Collections',
        link: '/pages/cv/collections'
      },
      {
        title: 'Commissions',
        link: '/pages/cv/commissions'
      },
      {
        title: 'Grants',
        link: '/pages/cv/grants'
      },
      {
        title: 'Press',
        link: '/pages/cv/press',
      }
    ]
  }, {
    title: 'Settings',
    icon: 'icon-ic_cog_solid',
    link: '/pages/settings/role'
  },

  //
  // {
  //   title: 'E-commerce',
  //   icon: 'nb-old-e-commerce',
  //   link: '/pages/old-dashboard',
  //   home: true,
  // },
  // {
  //   title: 'IoT Dashboard',
  //   icon: 'nb-home',
  //   link: '/pages/iot-old-dashboard',
  // },
  // {
  //   title: 'FEATURES',
  //   group: true,
  // },
  // {
  //   title: 'UI Features',
  //   icon: 'nb-keypad',
  //   link: '/pages/old-ui-features',
  //   children: [
  //     {
  //       title: 'Buttons',
  //       link: '/pages/old-ui-features/buttons',
  //     },
  //     {
  //       title: 'Grid',
  //       link: '/pages/old-ui-features/grid',
  //     },
  //     {
  //       title: 'Icons',
  //       link: '/pages/old-ui-features/icons',
  //     },
  //     {
  //       title: 'Modals',
  //       link: '/pages/old-ui-features/modals',
  //     },
  //     {
  //       title: 'Popovers',
  //       link: '/pages/old-ui-features/popovers',
  //     },
  //     {
  //       title: 'Typography',
  //       link: '/pages/old-ui-features/typography',
  //     },
  //     {
  //       title: 'Animated Searches',
  //       link: '/pages/old-ui-features/search-fields',
  //     },
  //     {
  //       title: 'Tabs',
  //       link: '/pages/old-ui-features/tabs',
  //     },
  //   ],
  // },
  // {
  //   title: 'Forms',
  //   icon: 'nb-compose',
  //   children: [
  //     {
  //       title: 'Form Inputs',
  //       link: '/pages/old-forms/inputs',
  //     },
  //     {
  //       title: 'Form Layouts',
  //       link: '/pages/old-forms/layouts',
  //     },
  //   ],
  // },
  // {
  //   title: 'Components',
  //   icon: 'nb-gear',
  //   children: [
  //     {
  //       title: 'Tree',
  //       link: '/pages/old-components/tree',
  //     }, {
  //       title: 'Notifications',
  //       link: '/pages/old-components/notifications',
  //     },
  //   ],
  // },
  // {
  //   title: 'Maps',
  //   icon: 'nb-location',
  //   children: [
  //     {
  //       title: 'Google Maps',
  //       link: '/pages/old-maps/gmaps',
  //     },
  //     {
  //       title: 'Leaflet Maps',
  //       link: '/pages/old-maps/leaflet',
  //     },
  //     {
  //       title: 'Bubble Maps',
  //       link: '/pages/old-maps/bubble',
  //     },
  //     {
  //       title: 'Search Maps',
  //       link: '/pages/old-maps/searchmap',
  //     },
  //   ],
  // },
  // {
  //   title: 'Charts',
  //   icon: 'nb-bar-chart',
  //   children: [
  //     {
  //       title: 'Echarts',
  //       link: '/pages/old-charts/echarts',
  //     },
  //     {
  //       title: 'Charts.js',
  //       link: '/pages/old-charts/chartjs',
  //     },
  //     {
  //       title: 'D3',
  //       link: '/pages/old-charts/d3',
  //     },
  //   ],
  // },
  // {
  //   title: 'Editors',
  //   icon: 'nb-title',
  //   children: [
  //     {
  //       title: 'TinyMCE',
  //       link: '/pages/old-editors/tinymce',
  //     },
  //     {
  //       title: 'CKEditor',
  //       link: '/pages/old-editors/ckeditor',
  //     },
  //   ],
  // },
  // {
  //   title: 'Tables',
  //   icon: 'nb-old-tables',
  //   children: [
  //     {
  //       title: 'Smart Table',
  //       link: '/pages/old-tables/smart-table',
  //     },
  //   ],
  // },
  // {
  //   title: 'Miscellaneous',
  //   icon: 'nb-shuffle',
  //   children: [
  //     {
  //       title: '404',
  //       link: '/pages/miscellaneous/404',
  //     },
  //   ],
  // },
  // {
  //   title: 'Auth',
  //   icon: 'nb-locked',
  //   children: [
  //     {
  //       title: 'Login',
  //       link: '/auth/sign-in',
  //     },
  //     {
  //       title: 'Register',
  //       link: '/auth/register',
  //     },
  //     {
  //       title: 'Request Password',
  //       link: '/auth/request-password',
  //     },
  //     {
  //       title: 'Reset Password',
  //       link: '/auth/reset-password',
  //     },
  //   ],
  // },
];
