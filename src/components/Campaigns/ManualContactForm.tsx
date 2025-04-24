
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';

interface Contact {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

interface ManualContactFormProps {
  onAdd: (contact: Contact) => void;
  contacts: Contact[];
}

export const ManualContactForm: React.FC<ManualContactFormProps> = ({ onAdd, contacts }) => {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    onAdd({
      firstName,
      lastName,
      phoneNumber,
      email
    });

    // Reset form
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setEmail('');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="(555) 123-4567"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
          />
        </div>
        
        <Button type="submit" className="md:col-span-2">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </form>

      {contacts.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Added Contacts ({contacts.length})</h3>
          <div className="border rounded-md divide-y">
            {contacts.map((contact, index) => (
              <div key={index} className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                  <p className="text-sm text-muted-foreground">{contact.phoneNumber}</p>
                  {contact.email && (
                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
