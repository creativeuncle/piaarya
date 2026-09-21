import PageForm from '../../../../../../components/PageForm';

export default async function EditPagePage({ params }) {
  const { id } = await params;
  return <PageForm id={id} />;
}
