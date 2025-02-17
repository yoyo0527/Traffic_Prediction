import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';
// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/Traffic_Prediction/assets/icons/navbar/${name}.svg`} />
);
const HOMEPAGE = import.meta.env.VITE_PUBLIC_URL || '';

export const navData = [
  {
    title: '車流量分析資料',
    path: '/Traffic_Prediction',
    icon: icon('ic-analytics'),
  },
  {
    title: '車輛違規查詢',
    path: '/Traffic_Prediction/violation',
    icon: icon('ic-user'),
  },
  // {
  //   title: 'Product',
  //   path: '/products',
  //   icon: icon('ic-cart'),
  //   info: (
  //     <Label color="error" variant="inverted">
  //       +3
  //     </Label>
  //   ),
  // },
  // {
  //   title: 'Blog',
  //   path: '/blog',
  //   icon: icon('ic-blog'),
  // },
  {
    title: 'Sign in',
    path: '/Traffic_Prediction/sign-in',
    icon: icon('ic-lock'),
  },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic-disabled'),
  // },
];
