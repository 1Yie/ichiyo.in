import { Metadata } from "next";
import DashboardProfile from "@/app/ui/dashboard-profile";


export const metadata: Metadata = {
    title: "ichiyo | 个人中心",
};

export default function Profile() {
    return (

        <DashboardProfile />

    );
}