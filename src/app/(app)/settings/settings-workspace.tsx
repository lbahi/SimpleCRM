// SimpleCRM — settings-workspace
"use client";

import { User, Building2, Bell, Shield, Palette } from 'lucide-react';

export function SettingsWorkspace() {
  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'Name, email, avatar, and how you appear to teammates.',
      icon: User,
      status: 'COMING SOON',
    },
    {
      id: 'workspace',
      title: 'Workspace',
      description: 'Organization name, timezone, and defaults for new users.',
      icon: Building2,
      status: 'COMING SOON',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Reminders, assignments, and email digests.',
      icon: Bell,
      status: 'COMING SOON',
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Password, sessions, and login exceptions.',
      icon: Shield,
      status: 'COMING SOON',
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Theme, density, and layout for tables and user panels.',
      icon: Palette,
      status: 'COMING SOON',
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Settings</h1>
          <p className="text-gray-600">
            Configure your account and workspace. These areas are placeholders for now—each section will become editable as preferences are implemented.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon size={20} className="text-gray-600" />
                  </div>
                  {section.status && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {section.status}
                    </span>
                  )}
                </div>
                <h3 className="text-lg mb-2">{section.title}</h3>
                <p className="text-sm text-gray-600">{section.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


