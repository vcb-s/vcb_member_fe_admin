import { Redirect, useLocation, useParams } from 'umi';

import { PageParam } from './types';
export default function () {
  const { uid } = useParams<PageParam>();
  return <Redirect push={false} to={`/person/${uid}/card`} />;
}
