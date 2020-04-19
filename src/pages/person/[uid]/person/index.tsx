import React, { useEffect } from 'react';
import { useRouteMatch, useDispatch, useSelector, PersonModel } from 'umi';

interface PagrParam {
  uid: string;
}

export default function PagePerson() {
  const match = useRouteMatch<PagrParam>();
  const uid = match.params.uid;
  const dispatch = useDispatch();
  const {} = useSelector(PersonModel.currentState);

  useEffect(() => {
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.getPersonInfo)({ uid }),
    );
  }, [dispatch, uid]);

  return <span>hello card</span>;
}
