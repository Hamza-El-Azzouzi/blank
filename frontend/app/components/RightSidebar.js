export default function RightSidebar() {
    const contacts = [
      { id: 1, name: 'Emma Watson', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
      { id: 2, name: 'James Smith', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
      { id: 3, name: 'Sophia Chen', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
      { id: 4, name: 'Marcus Johnson', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
      { id: 5, name: 'Isabella Garcia', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
      { id: 6, name: 'Alex Turner', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' },
      { id: 7, name: 'Luna Park', image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop' }
    ];
  
    return (
      <div className="right-sidebar">
        <h3 style={{ marginBottom: '15px' }}>Contacts</h3>
        {contacts.map((contact) => (
          <div key={contact.id} className="contact">
            <img
              src={contact.image}
              alt={contact.name}
              className="contact-avatar"
            />
            <span>{contact.name}</span>
            <div className="online-indicator" />
          </div>
        ))}
      </div>
    );
  }