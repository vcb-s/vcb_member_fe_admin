import React, { useEffect } from 'react';
import { useRouteMatch, useDispatch, useSelector, PersonModel } from 'umi';

import { PagrParam } from '@/pages/person/[uid]/types';

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
