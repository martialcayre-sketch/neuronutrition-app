import { Formik, Form, Field } from 'formik';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { practitionerRegisterSchema } from '../lib/validators';
import { createPractitionerProfile } from '../services/userService';

const Schema = practitionerRegisterSchema;

export default function RegisterPractitioner() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Créer un compte praticien</h1>
        <Formik
          initialValues={{ email: '', password: '', displayName: '' }}
          validationSchema={Schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const user = await createPractitionerProfile(values);
              toast.success('Compte praticien créé');
              if (user.emailVerified) navigate('/practitioner/home');
              else navigate('/verify-email');
            } catch (e: any) {
              toast.error(e.message || 'Erreur lors de la création');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <Field name="displayName">
                {({ field }: any) => (
                  <Input
                    label="Nom affiché"
                    {...field}
                    error={touched.displayName && (errors.displayName as string)}
                  />
                )}
              </Field>
              <Field name="email">
                {({ field }: any) => (
                  <Input
                    label="Email"
                    type="email"
                    {...field}
                    error={touched.email && (errors.email as string)}
                  />
                )}
              </Field>
              <Field name="password">
                {({ field }: any) => (
                  <Input
                    label="Mot de passe"
                    type="password"
                    {...field}
                    error={touched.password && (errors.password as string)}
                  />
                )}
              </Field>
              <Button type="submit" loading={isSubmitting} className="w-full">
                Créer le compte
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
