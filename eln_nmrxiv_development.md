1. Beispiel RADAR anschauen. 
    https://github.com/ComPlat/chemotion_ELN/pull/545 (OPEN 23.09.2021) 

    https://github.com/ComPlat/chemotion_ELN/pull/577 (Merged 17.11.2021) --> https://github.com/ComPlat/chemotion_ELN/tree/radar-integration
    https://github.com/jochenklar/chemotion_ELN/commit/877eba80f062b4df5dccc91144b4b37629cb8d18

    config/radar.yml.example
    development:
      :url: https://test.radar-service.eu
    production:
      :url: https://www.radar-service.eu

    Offene Fragen:
    Handelt es sich um Radar4Kit oder RadarChem?
    - RADAR4KIT ermöglicht es Forschenden des KIT ihre Forschungsdaten in einem Repositorium zu verwalten, zu archivieren, in Projektteams zu teilen und zu publizieren. (https://radar.kit.edu/)
    - RADAR4Chem RADAR4Chem hilft Ihnen, Ihre Forschungsdaten aus dem Bereich der Chemie so einfach wie möglich zu publizieren – ohne Komfort, Datensicherheit oder rechtliche Aspekte zu vernachlässigen. Und das kostenfrei!
 
 2. Admin user freischalten und anmelden: 
    name_abbreviation: 'ADM'
    password: PleaseChangeYourPassword
    User.find_by(last_name: 'Admin').update(account_active: true)
