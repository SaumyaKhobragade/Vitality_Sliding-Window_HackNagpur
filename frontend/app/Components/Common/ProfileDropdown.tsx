"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiOutlineDown } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CiLogout } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
const ProfileDropdown = ({ onLogout }: { onLogout?: () => void } = {}) => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 rounded-2xl"
        >
          <Avatar className="h-9 w-9 rounded-full">
            {/* {imageUrl ? (
              <AvatarImage src={imageUrl} alt={fullName ?? userEmail} />
            ) : (
              <AvatarFallback>
                {userEmail.charAt(0).toUpperCase()}
              </AvatarFallback>
            )} */}
          </Avatar>

          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium">
              {/* {fullName || userEmail.split("@")[0]} */}
            </span>
          </div>

          <AiOutlineDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
      >
        <DropdownMenuLabel className="px-4 py-3">
          {/* <p className="font-semibold">{fullName || userEmail.split("@")[0]}</p> */}
          <p className="text-sm text-muted-foreground">{userEmail}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer px-4 py-3 rounded-lg">
          <CgProfile className="h-4 w-4 mr-3 text-black" />
          {/* <Link href={profileLink} className="flex items-center w-full">
            Profile
          </Link> */}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer px-4 py-3 rounded-lg"
        >
          <CiLogout className="h-4 w-4 mr-3" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
