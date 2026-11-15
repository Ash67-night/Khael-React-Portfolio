const skillGroups = [
  {
    title: "Networking",
    items: ["TCP/IP", "Subnetting / VLSM", "VLANs", "OSPF", "Static routing", "DHCP / DNS", "NAT / ACLs"]
  },
  {
    title: "Systems and servers",
    items: ["Windows Server", "Active Directory", "Linux (Ubuntu)", "Bash basics", "VirtualBox / VMware"]
  },
  {
    title: "Tools and security",
    items: ["Cisco Packet Tracer", "Wireshark", "Nmap", "pfSense", "Zabbix", "Git"]
  },
  {
    title: "Soft skills",
    items: ["Troubleshooting", "Documentation", "Teamwork", "Communication", "Time management", "Eager to learn"]
  }
];

export default function Skills() {
  return (
    <section id="skills">
      <h2>Skills</h2>
      <p className="lead">
        Tools I use in labs and projects, and the habits I bring to a team.
      </p>

      <div className="grid">
        {skillGroups.map((group) => (
          <div className="card" key={group.title}>
            <h3>{group.title}</h3>
            <div className="chips">
              {group.items.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
