import { isAuthenticated } from '@/lib/actions/auth.actions'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React, { ReactNode } from 'react'

const RootLayout = async ({children} : {children: ReactNode}) => {
  const isAuth:boolean = await isAuthenticated();
  if (!isAuth) redirect('/sign-in');
  return (
    <div className='root-layout'>
      <nav className='flex flex-row gap-2'>
        <Link href={'/'} className='flex items-center gap-2'></Link>
        <Image src={'/logo.svg'} alt='Logo' width={38} height={32} />
        <h2 className='text-primary-100'> Prepwise</h2>
      </nav>
      {children}
    </div>
  )
}

export default RootLayout
