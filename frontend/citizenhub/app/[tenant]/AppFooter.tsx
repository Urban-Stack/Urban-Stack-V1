import {
  createTheme,
  Footer,
  FooterLink,
  FooterLinkGroup,
} from 'flowbite-react';
import Link from 'next/link';
import Image from 'next/image';

type AppFooterProps = {
  legalNoticeUrl: string;
  privacyUrl: string;
  contactUrl: string;
};

const LINK_THEME = createTheme({
  href: 'inline-block p-1 focus:outline-hidden focus:ring-2 focus:ring-primary-300 focus:rounded-md',
});

const AppFooter = (props: AppFooterProps) => {
  const { legalNoticeUrl, privacyUrl, contactUrl } = props;

  return (
    <Footer
      container
      className='flex flex-col md:flex-row justify-between items-center md:items-stretch bg-gray-100 shadow-none text-gray-500 h-20 md:h-14 px-4 pt-0 pb-1 md:px-6'
    >
      <FooterLinkGroup className='items-center'>
        <FooterLink
          href={legalNoticeUrl}
          target='_blank'
          as={Link}
          theme={LINK_THEME}
        >
          Impressum
        </FooterLink>
        <FooterLink
          href={privacyUrl}
          target='_blank'
          as={Link}
          theme={LINK_THEME}
        >
          Datenschutz
        </FooterLink>
        <FooterLink
          href={contactUrl}
          target='_blank'
          as={Link}
          theme={LINK_THEME}
        >
          Kontakt
        </FooterLink>
      </FooterLinkGroup>
      <FooterLinkGroup className='items-center'>
        <li className='text-sm me-4 md:mr-6'>Umsetzung durch</li>
        <FooterLink
          href='https://klosebrothers.de'
          title='Softwareentwicklung in Bielefeld'
          target='_blank'
          theme={LINK_THEME}
        >
          <Image
            className='mb-2'
            src='/klosebrothers-logo.svg'
            alt='Logo von klose brothers GmbH'
            height={24}
            width={54}
          />
        </FooterLink>
        <FooterLink
          href='https://teuto.net/'
          title='Kubernetes, Cloud und Hosting Solutions in Bielefeld'
          target='_blank'
          theme={LINK_THEME}
        >
          <Image
            src='/teutonet-logo.svg'
            alt='Logo von teuto.net Netzdienste GmbH'
            height={14}
            width={76}
          />
        </FooterLink>
      </FooterLinkGroup>
    </Footer>
  );
};

export default AppFooter;
