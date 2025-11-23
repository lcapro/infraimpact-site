import { useMemo } from 'react';

interface MailEntry {
  id: string;
  type: 'verify' | 'reset';
  email: string;
  createdAt: string;
}

const Mailbox = () => {
  const demoMails: MailEntry[] = useMemo(
    () => [
      {
        id: 'verify-1',
        type: 'verify',
        email: 'demo@infraimpact.nl',
        createdAt: new Date().toLocaleString('nl-NL'),
      },
      {
        id: 'reset-1',
        type: 'reset',
        email: 'support@infraimpact.nl',
        createdAt: new Date().toLocaleString('nl-NL'),
      },
    ],
    [],
  );

  return (
    <div className="grid gap-3" data-testid="demo-mails">
      {demoMails.map((mail) => (
        <div
          key={mail.id}
          className="border rounded-xl p-3 bg-white shadow-sm flex items-center justify-between gap-3 flex-wrap"
        >
          <div>
            <div className="font-semibold">
              {mail.type === 'verify' ? 'Verificatie' : 'Wachtwoordherstel'} voor {mail.email}
            </div>
            <div className="text-xs text-gray-600">{mail.createdAt}</div>
          </div>
          <button className="px-3 py-2 rounded-xl text-sm bg-blue-700 text-white hover:bg-blue-600">
            Open {mail.type === 'verify' ? 'verificatie' : 'reset'}-link
          </button>
        </div>
      ))}
      {demoMails.length === 0 && (
        <div className="text-sm text-gray-600">Nog geen mails verzonden.</div>
      )}
    </div>
  );
};

export default Mailbox;
