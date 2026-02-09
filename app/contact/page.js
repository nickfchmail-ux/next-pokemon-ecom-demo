import ContactService from './ContactService';

export const metadata = {
  title: 'Contact',
  description:
    'A contact page, providing our physical address and office hour. You can either contact us by visiting our physical store, or filling in you name, email and your content inside the form there. Whether you want to share your experience on our website, seek help, or just say a hello, please feel free and let us know more, and more about you.',
};

export default function ContactPage() {
  return <ContactService />;
}
