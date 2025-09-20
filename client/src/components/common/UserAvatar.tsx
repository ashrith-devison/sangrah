import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export const UserAvatar = () => {
  return (
    <>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </>
  );
};
