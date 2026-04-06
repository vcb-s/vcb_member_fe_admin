import { Navigate, useParams } from 'react-router-dom';

import { PageParam } from './types';
export default function () {
  const { uid = '' } = useParams<PageParam>();
  return <Navigate to={`/person/${uid}/card`} replace />;
}
