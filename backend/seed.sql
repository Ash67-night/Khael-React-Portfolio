-- Run this in MySQL Workbench AFTER your CREATE TABLE statements.
-- It copies the content that used to be hardcoded in React into your database.
USE portfolio_db;

INSERT INTO projects (title, description, technologies) VALUES
('Campus LAN design', 'Designed a three-building network with VLANs per department, inter-VLAN routing and OSPF, then tested it end to end.', 'Packet Tracer, VLAN, OSPF'),
('Windows Server domain lab', 'Set up Active Directory, DHCP, DNS and group policies on virtual machines for a 20-user mock office.', 'Windows Server, AD, GPO'),
('Network monitoring dashboard', 'Monitored uptime and bandwidth of lab devices with Zabbix and configured alerts for link failures.', 'Zabbix, SNMP, Linux'),
('Small office firewall', 'Configured pfSense with firewall rules, a guest VLAN and a site-to-site VPN in a home lab.', 'pfSense, VPN, Firewall'),
('Traffic analysis report', 'Captured and analysed packets with Wireshark to find the cause of slow DNS lookups and wrote up the fix.', 'Wireshark, DNS');

-- issuer and date_earned are left empty because I did not know them; fill them in later with UPDATE.
INSERT INTO certificates (title, certificate_file) VALUES
('Security and Connectivity Support', '/certificate/security-and-connectivity-support.pdf'),
('Exploring Networking with Cisco Packet Tracer', '/certificate/Exploring-Networking-with-Cisco_Packet-Tracer.pdf'),
('IoT Device Identity and Access Management (IAM)', '/images/participate.png'),
('Network Security and Multimedia Seminar', '/images/participate2.png');
