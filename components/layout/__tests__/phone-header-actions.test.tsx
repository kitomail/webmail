import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// The phone header cluster (⋮ with notifications and the command palette,
// then the account avatar) that every app shows at phone width.

const media = vi.hoisted(() => ({ mobile: true, desktop: false }));
vi.mock('@/hooks/use-media-query', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/use-media-query')>()),
  useIsMobile: () => media.mobile,
  useIsDesktop: () => media.desktop,
}));

const { PhoneHeaderActions, PhoneAppHeader } = await import('../phone-header-actions');
const { ContactList } = await import('@/components/contacts/contact-list');
const { ContextMenuItem } = await import('@/components/ui/context-menu');

beforeEach(() => {
  media.mobile = true;
  media.desktop = false;
});

describe('PhoneHeaderActions', () => {
  it('shows the menu and the account avatar on a phone', () => {
    render(<PhoneHeaderActions />);
    expect(screen.getByRole('button', { name: 'switch_account' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'more' }));
    // Notifications and the command palette (both "title" as keys in tests).
    expect(screen.getAllByRole('menuitem').map((m) => m.textContent)).toEqual(['title', 'title']);
  });

  // kitomail: a second tap on ⋮ closes the menu instead of opening it again.
  it('closes the menu on a second tap of the ⋮', async () => {
    render(<PhoneHeaderActions />);
    const more = screen.getByRole('button', { name: 'more' });
    fireEvent.click(more);
    expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0);
    // Let the menu arm its outside-click listener (it waits a tick).
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    fireEvent.mouseDown(more);
    fireEvent.click(more);
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
    expect(more).toHaveAttribute('aria-expanded', 'false');
  });

  // kitomail: in the app React listens on document itself (Next.js hydrates
  // the whole document), next to the menu's outside-click listener, so the
  // trigger has to stop the mousedown for listeners on the same node too.
  it('stops the mousedown for other listeners on the same node while open', async () => {
    render(<PhoneHeaderActions />);
    const more = screen.getByRole('button', { name: 'more' });
    fireEvent.click(more);
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
    const spy = vi.spyOn(Event.prototype, 'stopImmediatePropagation');
    fireEvent.mouseDown(more);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('opens the command palette from the menu', () => {
    const opened = vi.fn();
    window.addEventListener('bulwark:command-palette', opened);
    render(<PhoneHeaderActions />);
    fireEvent.click(screen.getByRole('button', { name: 'more' }));
    fireEvent.click(screen.getAllByRole('menuitem')[1]);
    expect(opened).toHaveBeenCalled();
    window.removeEventListener('bulwark:command-palette', opened);
  });

  it('lists the app entries first and closes the menu when one is picked', () => {
    const run = vi.fn();
    render(
      <PhoneHeaderActions
        menuItems={(close) => <ContextMenuItem label="Import" onClick={() => { close(); run(); }} />}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'more' }));
    const items = screen.getAllByRole('menuitem');
    expect(items[0]).toHaveTextContent('Import');
    fireEvent.click(items[0]);
    expect(run).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('draws nothing where the rail holds these controls', () => {
    media.desktop = true;
    media.mobile = false;
    const { container } = render(<PhoneHeaderActions />);
    expect(container).toBeEmptyDOMElement();
  });

  it('draws nothing on a tablet for an app that keeps the rail there', () => {
    media.mobile = false;
    const { container } = render(<PhoneHeaderActions below="md" />);
    expect(container).toBeEmptyDOMElement();
    render(<PhoneHeaderActions />);
    expect(screen.getByRole('button', { name: 'more' })).toBeInTheDocument();
  });
});

describe('PhoneAppHeader', () => {
  it('gives a screen without a header a title and the cluster', () => {
    render(<PhoneAppHeader title="Kanban" below="md" />);
    expect(screen.getByRole('heading', { name: 'Kanban' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'more' })).toBeInTheDocument();
  });
});

describe('apps use it', () => {
  it('puts the cluster in the Contacts list header on a phone', () => {
    render(
      <ContactList
        contacts={[]}
        selectedContactId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectContact={vi.fn()}
        onCreateNew={vi.fn()}
        selectedContactIds={new Set<string>()}
        onToggleSelection={vi.fn()}
        onSelectRangeContacts={vi.fn()}
        onSelectAll={vi.fn()}
        onClearSelection={vi.fn()}
        onBulkDelete={vi.fn()}
        onBulkAddToGroup={vi.fn()}
        onBulkExport={vi.fn()}
        onEditContact={vi.fn()}
        onDeleteContact={vi.fn()}
        onAddContactToGroup={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'more' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'switch_account' })).toBeInTheDocument();
  });
});
