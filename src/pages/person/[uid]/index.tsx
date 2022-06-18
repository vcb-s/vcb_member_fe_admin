import { Navigate, useSearchParams } from "umi";

export default function () {
  const [param] = useSearchParams();
  const uid = param.get("uid");
  if (uid) {
    return <Navigate to={`/person/${uid}/card`} replace />;
  }
  return null;
}
