import { ViewUser } from 'src/model/db/ViewUser';

export const getCount = (user: ViewUser) => {
  if (user.quota <= 0) return 0;
  const mathCount = user.avg
    ? Math.ceil(user.quota / user.avg)
    : Math.ceil(user.quota / 10);

  return mathCount > 10 ? 10 : mathCount;
};
