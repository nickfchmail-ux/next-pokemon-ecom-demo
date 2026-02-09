import UserProfile from '../../_component/UserProfile';
import { CardContent, CardTitle } from '../../_componentAPI/card';
import { auth } from '../../_lib/auth';
import { getUser } from '../../_lib/data-service';


export const metadata = {
  title: 'Your Profile',
  description: 'You can manage your personal information here.',
};



export default async function Page() {
  const session = await auth();

  const { id, created_at, ...userProfile } = await getUser(session.user.email);

  console.log('user profile: ', userProfile);

  return (
    <div className="h-full bg-primary-200  px-4">
      <div className="flex text-center flex-col g-0  rounded-t-lg p-0 h-[15vh]  place-items-center bg-primary-100 mt-1 mb-2">
        <CardTitle className="text-4xl font-extrabold text-primary-800 mt-8 bg">
          My Profile
        </CardTitle>
        <div className={`text-xs flex flex-col self-end mr-2 text-primary-800`}>
          {' '}
          {session.user.email}
        </div>
      </div>
      <CardContent className="px-0">
        <UserProfile>{userProfile}</UserProfile>
      </CardContent>
    </div>
  );
}
