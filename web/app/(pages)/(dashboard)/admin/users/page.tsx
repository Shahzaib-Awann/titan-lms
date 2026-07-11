import {
  Users,
  GraduationCap,
  ShieldCheck,
  UserPlus,
  Activity,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const userStats = [
  {
    title: "Students",
    value: "12,540",
    description: "+320 this month",
    icon: GraduationCap,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Teachers",
    value: "245",
    description: "+12 this month",
    icon: Users,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    title: "Admins",
    value: "8",
    description: "No changes",
    icon: ShieldCheck,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    title: "Active Users",
    value: "11,982",
    description: "96% activity rate",
    icon: Activity,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

const recentUsers = [
  {
    name: "Ahmed Khan",
    role: "Student",
    status: "Active",
    joined: "Today",
  },
  {
    name: "Sara Ali",
    role: "Teacher",
    status: "Active",
    joined: "Yesterday",
  },
  {
    name: "Hassan Ahmed",
    role: "Admin",
    status: "Active",
    joined: "3 days ago",
  },
];

const UsersPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>

          <p className="text-muted-foreground">
            Manage students, teachers, and administrators.
          </p>
        </div>

        <Button
          className="
            gap-2
            rounded-xl
            bg-primary
            hover:bg-primary/90
          "
        >
          <UserPlus className="size-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}

      <div
        className="
          grid
          gap-4

          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        {userStats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="
                rounded-2xl
                border
                border-border

                bg-card

                p-5

                shadow-card

                transition

                hover:border-primary/40
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      text-muted-foreground
                    "
                  >
                    {item.title}
                  </p>

                  <h2
                    className="
                      mt-2
                      text-3xl
                      font-bold
                    "
                  >
                    {item.value}
                  </h2>

                  <p
                    className="
                      mt-2
                      text-xs
                      text-muted-foreground
                    "
                  >
                    {item.description}
                  </p>
                </div>

                <div
                  className={`
                    flex
                    size-11
                    items-center
                    justify-center

                    rounded-xl

                    ${item.bg}
                  `}
                >
                  <Icon
                    className={`
                      size-5
                      ${item.color}
                    `}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content */}

      <div
        className="
          grid
          gap-6

          xl:grid-cols-3
        "
      >
        {/* Recent Users */}

        <div
          className="
            xl:col-span-2

            rounded-2xl
            border
            border-border

            bg-card

            shadow-card
          "
        >
          <div
            className="
              flex
              items-center
              justify-between

              border-b
              border-border

              px-6
              py-4
            "
          >
            <div>
              <h3 className="text-lg font-semibold">Recent Users</h3>

              <p className="text-sm text-muted-foreground">
                Latest registered accounts
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="
                text-primary
                hover:bg-primary/10
              "
            >
              View All
            </Button>
          </div>

          <div className="divide-y divide-border">
            {recentUsers.map((user) => (
              <div
                key={user.name}
                className="
                  flex
                  items-center
                  justify-between

                  px-6
                  py-4

                  hover:bg-accent/40

                  transition
                "
              >
                <div>
                  <p className="font-medium">{user.name}</p>

                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>

                <div className="text-right">
                  <span
                    className="
                      rounded-full

                      bg-green-400/10

                      px-3
                      py-1

                      text-xs

                      font-medium

                      text-green-400
                    "
                  >
                    {user.status}
                  </span>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {user.joined}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}

        <div
          className="
            rounded-2xl
            border
            border-border

            bg-card

            p-6

            shadow-card
          "
        >
          <h3 className="text-lg font-semibold">Quick Actions</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Common user operations
          </p>

          <div className="mt-5 space-y-3">
            <Button
              className="
                w-full
                justify-start

                rounded-xl

                bg-primary/10

                text-primary

                hover:bg-primary/20
              "
            >
              <GraduationCap className="mr-2 size-4" />
              Add Student
            </Button>

            <Button
              className="
                w-full
                justify-start

                rounded-xl

                bg-green-400/10

                text-green-400

                hover:bg-green-400/20
              "
            >
              <Users className="mr-2 size-4" />
              Add Teacher
            </Button>

            <Button
              className="
                w-full
                justify-start

                rounded-xl

                bg-yellow-400/10

                text-yellow-400

                hover:bg-yellow-400/20
              "
            >
              <ShieldCheck className="mr-2 size-4" />
              Create Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
