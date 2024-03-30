import {CircleArrowDown} from "lucide-react";

export default function Introduction() {
    return (
        <div className={"bgimg flex flex-col gap-4 justify-center text-white w-1/4 text-wrap animate-fade-up animate-ease-linear"}>
            <div className={"flex flex-col items-center "}>
                <h1 className={"text-6xl font-black"}>The next generation of the Linux Desktop.</h1>
                <h1 className={"text-3xl"}>Powered by the latest in Universal Blue and Fedora.</h1>

                <p className={"mt-10 text-2xl text-center"}>Aurora is a fast, beautiful, solid and enjoyable desktop
                    experience for users and developers alike.
                    <br/> With so many batteries included, you might as well power your starship with it.
                    Or configure your dev environment.
                </p>
            </div>
            <div className={"mt-5 flex flex-row items-center gap-5 justify-center items-end animate-bounce"}>
                <CircleArrowDown className={"w-10 h-10"}/>
                Learn More
            </div>
        </div>
    )
}