import { Redirect, useLocation } from 'umi';

export default function () {
  const { pathname } = useLocation();
  return <Redirect push={false} to={`${pathname}/card`} />;
}
