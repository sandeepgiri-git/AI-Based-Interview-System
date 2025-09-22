"use client";

import { z } from "zod";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "./FormField";
import { useRouter } from "next/navigation";
import { auth } from "@/Firebase/client";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { signIn, signUp } from "@/lib/actions/auth.actions";
 

const AuthFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(4)
  })
}

const AuthForm = ({type} : {type: FormType}) => {
  const formSchema = AuthFormSchema(type)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name : "",
      email : "",
      password : "",
    },
  });
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if(type === 'sign-up'){
        const {name, email , password,} = values;
        
        const userCred = await createUserWithEmailAndPassword(auth, email, password);

        const res = await signUp({uid: userCred.user.uid, name:name!,email, password})

        if(!res?.success) {
          toast.error(res?.message);
          return;
        }
        toast.success("Account Created Successfully ! Please sign in");
        router.push('/sign-in');
      }else{

        const {email, password} = values;
        
        const userCred = await signInWithEmailAndPassword(auth, email, password);

        const idToken = await userCred.user.getIdToken()

        if(!idToken) {
          toast.error("Sign in Failed")
          return;
        }

        await signIn({email, idToken});

        toast.success("Sign in Successfully!");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`Error occured ${error}`);
    }
  }

  const isSignIn = type === "sign-in";
  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="card flex flex-col gap-6 px-10 py-14 ">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
        <h2 className="text-primary-100">PrepWise</h2>
        </div>
        <h3>Practice Job interview with AI</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (
              <FormField name="name" label="Name" control={form.control} placeholder="Your Name" />
            )}
            <FormField name="email" label="Email" control={form.control} placeholder="Your Email" />
            <FormField type="password" name="password" label="Password" control={form.control} placeholder="Enter Your Password" />
            <Button className="btn" type="submit">{isSignIn ? "Sign in" : "Create an Account"}</Button>
          </form>
        </Form>
        <p className="text-center" >
          {isSignIn ? "No Account yet ?" : "Have an Account ?"}
          <Link className="font-bold text-user-primary ml-1" href={isSignIn ? '/sign-up' : '/sign-in'}> {isSignIn ? "Sign up" : "Sign in"}</Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
